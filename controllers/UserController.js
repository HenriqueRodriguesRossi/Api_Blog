const router = require("express").Router();
const yup = require("yup");
const captureErrorYup = require("../utils/captureErrorYup");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const speakeasy = require('speakeasy');
const checkToken = require("../utils/checkToken");

// Função auxiliar para gerar tokens JWT
function generateToken(userId) {
    const secret = process.env.SECRET;
    return jwt.sign({ id: userId }, secret);
}

// Rota para criar um novo usuário
router.post("/new_user", async (req, res) => {
    try {
        const { full_name, name_of_user, email, password } = req.body;

        const userSchema = yup.object().shape({
            full_name: yup.string().required('O nome completo é obrigatório!'),
            name_of_user: yup
                .string()
                .required('O nome de usuário é obrigatório!')
                .min(5, 'O nome de usuário deve ter pelo menos 5 caracteres')
                .max(20, 'O nome de usuário deve ter no máximo 20 caracteres')
                .matches(/@.+/, 'O nome de usuário deve conter um "@"'),
            email: yup.string().email('Digite um email válido!').required('O email é obrigatório!'),
            password: yup
                .string()
                .required('A senha é obrigatória!')
                .min(6, 'A senha deve ter pelo menos 6 caracteres')
                .max(30, 'A senha deve ter no máximo 30 caracteres')
                .matches(
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
                    'A senha deve conter pelo menos uma letra maiúscula, uma letra minúscula, um número e um símbolo'
                ),
        });

        await userSchema.validate(req.body, { abortEarly: false });

        const existingEmail = await User.findOne({ email });
        const existingUserName = await User.findOne({ name_of_user });

        if (existingEmail) {
            return res.status(422).send({
                mensagem: "Esse email já está em uso!"
            });
        } else if (existingUserName) {
            return res.status(422).send({
                mensagem: "Esse nome de usuário já está em uso!"
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const newUser = new User({
            full_name,
            name_of_user,
            email,
            password: passwordHash
        });

        await newUser.save();

        return res.status(201).send({
            mensagem: "Usuário cadastrado com sucesso!",
            token: generateToken(newUser._id),
            user_id: newUser._id
        });
    } catch (error) {
        if (error instanceof yup.ValidationError) {
            const errors = [captureErrorYup(error)];

            return res.status(500).send({
                errors
            });
        } else {
            console.error(error);
            return res.status(500).send({
                mensagem: "Erro ao cadastrar usuário!"
            });
        }
    }
});

// Rota para efetuar login
router.post("/login", async (req, res) => {
    try {
        const { name_of_user, password, otp } = req.body;

        if (!name_of_user || !password) {
            return res.status(400).send({
                mensagem: "Todos os campos devem ser preenchidos!"
            });
        }

        const user = await User.findOne({ name_of_user });

        if (!user || !(await bcrypt.compareSync(password, user.password))) {
            return res.status(433).send({
                mensagem: "Email ou senha estão incorretos!"
            });
        }

        // Verificar se a autenticação de dois fatores está ativada
        if (user.isTwoFactorEnabled) {
            // Verificar o código OTP
            const isOTPValid = speakeasy.totp.verify({
                secret: user.twoFactorSecret,
                encoding: 'ascii',
                token: otp,
                window: 1,
            });

            if (!isOTPValid) {
                return res.status(433).send({
                    mensagem: 'Código OTP incorreto!',
                });
            }
        }

        return res.status(200).send({
            mensagem: "Login efetuado com sucesso!",
            token: generateToken(user._id),
            user_id: user._id
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send({
            mensagem: "Erro ao efetuar o login!"
        });
    }   
});

// Rota para ativar autenticação de dois fatores
router.put("/activate-2FA", checkToken, async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).send({
                mensagem: "Nenhum usuário com esse email encontrado!"
            });
        }

        await User.findOneAndUpdate({
            email,
            isTwoFactorEnabled: true
        });

        return res.status(200).send({
            mensagem: "Autenticação de dois fatores ativada!"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send({
            mensagem: "Erro ao ativar autenticação de dois fatores!"
        });
    }
});

module.exports = router;