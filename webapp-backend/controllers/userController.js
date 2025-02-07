const User = require("../models/user");
const Group = require("../models/group");
const adminController = require("../controllers/adminController");
const jwtUtils = require("../utils/jwtUtils");
const bcrypt = require('bcryptjs');

const login = async (req) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return {
            status: 400,
            message: 'Username e password sono richiesti.'
        };
    }

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return {
                status: 401,
                message: 'Username o password errati.'
            };
        }

        const validPassword = await bcrypt.compare(password, user.passwordHash);
        if (!validPassword) {
            return {
                status: 401,
                message: 'Username o password errati.'
            };
        }

        const token = jwtUtils.generateToken(user);
        return {
            status: 200,
            message: 'Login effettuato con successo.',
            token,
            userId: user._id.toString()
        };
    } catch (error) {
        console.error('Errore durante il login:', error);
        return {
            status: 500,
            message: 'Errore del server, impossibile connettersi al database.'
        }
    }
};

const register = async (req) => {
    const { username, password, email, firstName, lastName } = req.body;

    if (!username || !password || !email || !firstName || !lastName) {
        return {
            status: 400,
            message: 'Tutti i campi sono richiesti.'
        };
    }

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return {
                status: 400,
                message: 'Username già esistente.'
            };
        }

        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return {
                status: 400,
                message: 'Email già associata a un account.'
            };
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser = new User({
            username,
            passwordHash,
            email,
            name: firstName,
            surname: lastName,
        });
        await newUser.save();

        return {
            status: 201,
            message: 'Utente registrato con successo.'
        };
    } catch (error) {
        console.error(error);
        return {
            status: 500,
            message: 'Errore durante la registrazione.'
        };
    }
};

const getProfile = async (req) => {
    const userId = req.params.userId; // Prendi l'ID utente dal token
    try {
        const user = await User.findById(userId).select('-passwordHash'); // Non includere la password nei dati restituiti

        if (!user) {
            return {
                status: 404,
                message: 'Utente non trovato.'
            };
        }

        return {
            status: 200,
            user
        };
    } catch (err) {
        console.error(err);
        return {
            status: 500,
            message: 'Errore durante il recupero del profilo.'
        };
    }
};

const logout = async (req) => {
    console.log(`Logout eseguito per l'utente ${req.user.username}`);
    return {
        status: 200,
        message: 'Logout eseguito con successo.'
    };
};

const updateNameSurname = async (req) => {
    const { name, surname } = req.body;
    const userId = req.user.id; // Prendi l'ID utente dal token

    try {
        const user = await User.findById(userId);

        if (!user) {
            return { status: 404, message: 'Utente non trovato.' };
        }

        user.name = name || user.name;
        user.surname = surname || user.surname;

        await user.save();
        return {
            status: 200,
            message: 'Nome e cognome aggiornati con successo.'
        };
    } catch (err) {
        console.error(err);
        return {
            status: 500,
            message: 'Errore durante l\'aggiornamento del profilo.'
        };
    }
};

const updateUsername = async (req) => {
    const { username } = req.body;
    const userId = req.user.id;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return {
                status: 404,
                message: 'Utente non trovato.'
            };
        }

        const existingUser = await User.findOne({ username });

        if (existingUser) {
            return {
                status: 400,
                message: 'Username già in uso.'
            };
        }

        user.username = username;
        await user.save();

        return {
            status: 200,
            message: 'Username aggiornato con successo.'
        };
    } catch (err) {
        console.error(err);
        return {
            status: 500,
            message: 'Errore durante l\'aggiornamento dell\'username.'
        };
    }
};

const updateEmail = async (req) => {
    const { email } = req.body;
    const userId = req.user.id;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return {
                status: 404,
                message: 'Utente non trovato.'
            };
        }

        const existingEmail = await User.findOne({ email });

        if (existingEmail) {
            return {
                status: 400,
                message: 'Email già in uso.'
            };
        }

        user.email = email;
        await user.save();

        return {
            status: 200,
            message: 'Email aggiornata con successo.'
        };
    } catch (err) {
        console.error(err);
        return {
            status: 500,
            message: 'Errore durante l\'aggiornamento dell\'email.'
        };
    }
};

const changePassword = async (req) => {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return {
                status: 404,
                message: 'Utente non trovato.'
            };
        }

        const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);

        if (!isMatch) {
            return {
                status: 400,
                message: 'Password attuale errata.'
            };
        }

        user.passwordHash = await bcrypt.hash(newPassword, 10);
        await user.save();

        return {
            status: 200,
            message: 'Password aggiornata con successo.'
        };
    } catch (err) {
        console.error(err);
        return {
            status: 500,
            message: 'Errore durante il cambio della password.'
        };
    }
};

const getUserGroups = async (req) => {
    try {
        const userObj = req.user;

        const user = await User.findById(userObj.id).populate('groups');

        if (!user) {
            return {
                status: 404,
                message: 'Utente non trovato.'
            };
        }

        return {
            status: 200,
            groups: user.groups || []
        };
    } catch (error) {
        console.error('Errore nel recupero dei gruppi:', error);
        return {
            status: 500,
            message: 'Errore interno del server.'
        };
    }
};

const deleteUserAccount = async (req) => {
    const userId = req.user.id;
    console.log(req.user.id);

    try {
        const groupsWhereAdmin = await Group.find({ admin: userId });

        for (let group of groupsWhereAdmin) {
            try {
                await adminController.removeAdminAndHandleContainers(group._id, userId);
            } catch (error) {
                return {
                    status: 400,
                    message: `Errore nella gestione del gruppo ${group.name}: ${error.message}`
                };
            }
        }

        await User.findByIdAndDelete(userId);
        return {
            status: 200,
            message: 'Account eliminato con successo.'
        };
    } catch (error) {
        return {
            status: 500,
            message: 'Errore durante l\'eliminazione dell\'account.',
            error: error.message
        };
    }
};

module.exports = {
    getUserGroups,
    deleteUserAccount,
    login,
    register,
    logout,
    getProfile,
    updateNameSurname,
    updateUsername,
    updateEmail,
    changePassword,
};
