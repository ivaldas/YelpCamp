const express = require('express');
if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config();
}
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');

const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');

const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');

const MongoDBStore = require('connect-mongo');

//###################### MONGO / MONGOOSE ##################################

// const dbUrl = process.env.DB_URL;
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';

db().catch((err) => console.log('mongo connection error', err));
async function db() {
	await mongoose.connect(dbUrl);
	// await mongoose.connect(dbUrl);
	console.log('Mongo Database Connected');
}
// brew services start mongodb-community@6.0 --> to start service
// brew services stop mongodb-community@6.0 --> to stop service

//#########################################################################
const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());
// app.use(mongoSanitize({ replaceWith: '_' }));

const secret = process.env.SECRET || 'thisismysecret!';

const store = new MongoDBStore({
	mongoUrl: dbUrl,
	secret,
	touchAfter: 24 * 60 * 60
});
store.on('error', function(e) {
	console.log('SESSION STORE ERROR', e);
});

const sessionConfig = {
	store,
	name: 'mySession',
	secret,
	resave: false,
	saveUninitialized: true,
	cookie: {
		httpOnly: true,
		// secure: true, // --> On when deployed, doesnt work in localhost
		expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
		maxAge: 1000 * 60 * 60 * 24 * 7
	}
};
app.use(session(sessionConfig));
app.use(flash());

// =================== HELMET ==========================================
const scriptSrcUrls = [
	'https://stackpath.bootstrapcdn.com/',
	'https://api.tiles.mapbox.com/',
	'https://api.mapbox.com/',
	'https://kit.fontawesome.com/',
	'https://cdnjs.cloudflare.com/',
	'https://cdn.jsdelivr.net'
];
const styleSrcUrls = [
	'https://kit-free.fontawesome.com/',
	'https://stackpath.bootstrapcdn.com/',
	'https://cdn.jsdelivr.net',
	'https://api.mapbox.com/',
	'https://api.tiles.mapbox.com/',
	'https://fonts.googleapis.com/',
	'https://use.fontawesome.com/'
];
const connectSrcUrls = [
	'https://api.mapbox.com/',
	'https://a.tiles.mapbox.com/',
	'https://b.tiles.mapbox.com/',
	'https://events.mapbox.com/'
];
const fontSrcUrls = [];
app.use(
	helmet({
		// crossOriginEmbedderPolicy: same - origin,
		crossOriginEmbedderPolicy: false,
		// crossOriginResourcePolicy: {
		// 	allowOrigins: [ '*' ]
		// },
		// contentSecurityPolicy: {
		// 	directives: {
		// 		defaultSrc: [ '*' ],
		// 		imgSrc: [ "* 'self' data:" ],
		// 		scriptSrc: [ "* 'unsafe-inline' blob:" ]
		// 	}
		// }
		contentSecurityPolicy: {
			directives: {
				defaultSrc: [],
				connectSrc: [ "'self'", ...connectSrcUrls ],
				scriptSrc: [ "'unsafe-inline' 'self'", ...scriptSrcUrls ],
				styleSrc: [ "'self' 'unsafe-inline'", ...styleSrcUrls ],
				workerSrc: [ "'self' blob:" ],
				objectSrc: [],
				imgSrc: [
					"'self' blob: data:",
					'https://res.cloudinary.com/ivaldas/',
					// 'https://cloudinary.com/',
					'https://images.unsplash.com'
				],
				fontSrc: [ "'self'", ...fontSrcUrls ]
			}
		}
	})
);
// ==================== END HELMET =========================================

app.use(passport.initialize()); // --> Make Sure Sessions ar used BEFORE passport dessions ^
app.use(passport.session()); //    --> VERY IMPORTAND!!!!!!!
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
	if (![ '/login', '/' ].includes(req.originalUrl)) {
		req.session.returnTo = req.originalUrl;
	}
	// console.log(req.session);
	// console.log(req.query);
	res.locals.currentUser = req.user;
	res.locals.success = req.flash('success');
	res.locals.error = req.flash('error');
	next();
});

//-------------------------------------------------------------------------

app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:campId/reviews', reviewRoutes);
app.use('/', userRoutes);

app.get('/', (req, res, next) => {
	res.render('home');
});

// app.all('*', (req, res, next) => {
// 	next(new ExpressError('Page Not Found', 404));
// });

app.use((err, req, res, next) => {
	const { statusCode = 500 } = err;
	if (!err.message) err.message = 'Oh no, Something Went Wrong!';
	// res.status(statusCode).send(message);
	res.status(statusCode).render('error', { err });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Serving on port ${port}`));
