const passport = require("passport");
const { Strategy } = require("passport-local");

const User = require("../models/user");

passport.use(
    "signup",
    new Strategy({
            usernameField: "email",
            passwordField: "password",
            passReqToCallback: true,
        },
        async(req, email, password, done) => {
            try {
                if (password !== req.body.confirm_password) {
                    return done(null, false, { message: "Las contraseñas no coinciden" });
                }
                if (password.length < 6) {
                    return done(null, false, { message: "La contraseña debe tener al menos 6 caracteres" });
                }

                // Search an existing email
                const userFound = await User.findOne({ email: email.toLowerCase() });

                // return an error if the email already exists
                if (userFound) {
                    return done(null, false, { message: "Ese email ya está registrado" });
                }

                // create a new User
                const newUser = new User();
                newUser.email = email;
                newUser.password = await User.encryptPassword(password);
                const userSaved = await newUser.save();

                // create a success message
                req.flash("success", "Ingresa con tu nueva cuenta");

                return done(null, userSaved);
            } catch (error) {
                return done(error);
            }
        }
    )
);

passport.use(
    "signin",
    new Strategy({
            passwordField: "password",
            usernameField: "email",
        },
        async(email, password, done) => {
            try {
                // Find the user by email
                const userFound = await User.findOne({ email: email.toLowerCase() });

                // if user does not exists
                if (!userFound) return done(null, false, { message: "Usuario no encontrado" });

                // match password
                const match = await userFound.matchPassword(password);

                if (!match) return done(null, false, { message: "Contraseña incorrecta" });

                return done(null, userFound);
            } catch (error) {
                return done(error);
            }
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async(id, done) => {
    try {
        const user = await User.findById(id).select("-password").lean();
        return done(null, user || false);
    } catch (error) {
        return done(error, false);
    }
});
