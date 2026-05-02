import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import userRepository from '../repositories/UserRepository.js';
import roleRepository from '../repositories/RoleRepository.js';

class AuthService {

    validatePassword(password) {
        const minLength = password.length >= 8;
        const hasUpper = /[A-Z]/.test(password);
        const hasDigit = /[0-9]/.test(password);
        const hasSpecial = /[#$%&*@]/.test(password);
        if (!minLength || !hasUpper || !hasDigit || !hasSpecial) {
            const err = new Error('El password debe tener mínimo 8 caracteres, 1 mayúscula, 1 dígito y 1 carácter especial (#$%&*@)');
            err.status = 400;
            throw err;
        }
    }

    async signUp({ email, password, name, lastName, phoneNumber, birthdate, roles = ['user'], url_profile, address }) {
        const existing = await userRepository.findByEmail(email);
        if (existing) {
            const err = new Error('El email ya se encuentra en uso');
            err.status = 400;
            throw err;
        }

        this.validatePassword(password);

        const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS ?? '10', 10);
        const hashed = await bcrypt.hash(password, saltRounds);

        const roleDocs = [];
        for (const r of roles) {
            let roleDoc = await roleRepository.findByName(r);
            if (!roleDoc) roleDoc = await roleRepository.create({ name: r });
            roleDocs.push(roleDoc._id);
        }

        const user = await userRepository.create({
            email,
            password: hashed,
            name,
            lastName,
            phoneNumber,
            birthdate,
            roles: roleDocs,
            url_profile,
            address
        });

        return {
            id: user._id,
            email: user.email,
            name: user.name,
            lastName: user.lastName
        };
    }

    async signIn({ email, password }) {
        const user = await userRepository.findByEmail(email);
        if (!user) {
            const err = new Error('Credenciales inválidas');
            err.status = 401;
            throw err;
        }

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) {
            const err = new Error('Credenciales inválidas');
            err.status = 401;
            throw err;
        }

        const token = jwt.sign({
            sub: user._id,
            roles: user.roles.map(r => r.name)
        },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
        );

        return { token };
    }
}

export default new AuthService();
