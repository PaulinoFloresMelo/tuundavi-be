import { Hono } from 'hono';
import { z } from "zod";
import { zValidator } from '@hono/zod-validator';
import { db } from '../db/index';
import { usersTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { sign, verify } from 'hono/jwt'


if (!process.env.JWT_SECRET){
    throw new Error("Missing JWT_SECRET");    
}

export const authRouter = new Hono();

const loginSchema = z.object({
    email: z.string().trim().toLowerCase().email({
        message: "invalid email address"
    }),
    password: z.string().min(6, {
        message: "Password must be at least 6 character long"
    })
})

const registerSchema = z.object({
    email: z.string().trim().toLowerCase().email({
        message: "invalid email address"
    }),
    password: z.string().min(6, {
        message: "Password must be at least 6 character long"
    }),
    username: z.string().trim().toLowerCase().min(3, {
        message: "Username must be at least 6 character long"
    }).optional(),
})


// /api/v1/auth/login
authRouter.post("/login", zValidator("json", loginSchema),
    async(c) => {
    const {email, password} = await c.req.json();

    const [user] = await db
    .select()
    .from(usersTable)
    .where( eq(usersTable.email, email) )

    
    if ( !user ) {
        return c.json({message: "Credentials invalid"}, 404 )
    }
    
    const isMatch = await Bun.password.verify(password, user.password)
    
    if ( !isMatch ) {
        return c.json({message: "Credentials invalid"}, 401 )
    }
    
    const payload = {
        id: user.id, 
        email: user.email,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 // a day
    }
    const secretKey = process.env.JWT_SECRET as string;
    const token = await sign(payload, secretKey)

    const userResponse = {email:user.email, userId: user.id};

    return c.json({ user: userResponse, token })
})

// /api/v1/auth/register
authRouter.post("/register", zValidator("json", registerSchema),
    async(c) => {
    
    const {
        email, 
        password, 
        firstName, 
        paternalName,
        maternalName} = await c.req.json();

    const [user] = await db
    .select()
    .from(usersTable)
    .where( eq(usersTable.email, email) )

    if (user) {
        return c.json({ message: "Email already registered" }, 400)
    } 
    const hashedPassword = await Bun.password.hash(password)

    const newUser = await db.insert(usersTable).values({
        email,
        password: hashedPassword,
        firstName: firstName,
        paternalName: paternalName,
        maternalName: maternalName
    }).returning({
        id: usersTable.id,
        email: usersTable.email,
        firstName: usersTable.firstName
    })

    return c.json({newUser})
})

// /api/v1/auth/check-status
authRouter.get("/check-status",
    async(c) => {
    
    const tokenToVerify = await c.req.header('Authorization')?.replace('Bearer ', '');

    if (!tokenToVerify) {
    return c.json({ error: 'Token no proporcionado' }, 401);
    }

    const secretKey = process.env.JWT_SECRET as string;
    const decodedPayload = await verify(tokenToVerify, secretKey)
    const emailToFind = decodedPayload.email as string;
    
    const [user] = await db
    .select()
    .from(usersTable)
    .where( eq(usersTable.email, emailToFind) )
    
    if ( !user ) {
        return c.json({message: "Credentials invalid"}, 404 )
    }

    const userResponse = {email:user.email, userId: user.id};
    
    const payload = {
        id: user.id, 
        email: user.email,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 // a day
    }
    const token = await sign(payload, secretKey)

    return c.json({ user: userResponse, token }) 
})


export default authRouter;