import userRepository from '../repositories/UserRepository.js';
import roleRepository from '../repositories/RoleRepository.js';
import bcrypt from 'bcrypt';

export default async function seedUsers() {
    const existing = await userRepository.findByEmail('admin@admin.com');
    if (!existing) {
        const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS ?? '10', 10);
        const hashed = await bcrypt.hash('Admin123#', saltRounds);

        let adminRole = await roleRepository.findByName('admin');
        if (!adminRole) adminRole = await roleRepository.create({ name: 'admin' });

        await userRepository.create({
            email: 'admin@admin.com',
            password: hashed,
            name: 'Admin',
            lastName: 'Sistema',
            phoneNumber: '999999999',
            birthdate: new Date('1990-01-01'),
            roles: [adminRole._id]
        });

        console.log('Seeded admin user: admin@admin.com / Admin123#');
    }
}