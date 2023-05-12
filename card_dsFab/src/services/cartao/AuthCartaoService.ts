import prismaClient from "../../../prisma"
import { compare } from 'bcryptjs';
import { sign } from 'jsonwebtoken';

interface AuthRequest {
    num_cartao: string;
    cvv: string;
}

class AuthCartaoService {
    async execute({ num_cartao, cvv }: AuthRequest) {

        const cartao = await prismaClient.cartao.findFirst({
            where: {
                num_cartao: num_cartao
            }
        })

        if (!cartao) {
            throw new Error("Usuário ou cvv incorretos!");
        }

        const cvvMatch = await compare(cvv, cartao.cvv);

        if (!cvvMatch) {
            throw new Error("cvv incorreta");
        }

        const token = sign(
            {
                num_cartao: cartao.num_cartao,
                cvv: cartao.cvv
            },
            process.env.JWT_SECRET,
            {
                subject: cartao.id,
                expiresIn: '30d'
            }
        )

        return {
            id: cartao.id,
            num_cartao: cartao.num_cartao,
            cvv: cartao.cvv,
            token: token
        }

    }
}

export { AuthCartaoService }