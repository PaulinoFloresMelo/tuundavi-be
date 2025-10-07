import { Hono } from "hono";
import { jwt } from 'hono/jwt';
import { z } from "zod";
import { eq } from 'drizzle-orm';
import { db } from '../db/index';
import { zValidator } from '@hono/zod-validator';
import { imagesTable, termsTable } from "../db/schema";

export const termRouter = new Hono();

if (!process.env.JWT_SECRET){
    throw new Error("Missing JWT_SECRET");    
}

const registerTermSchema = z.object({
    content: z.string().toLowerCase(),
})

const registerImageSchema = z.object({
    url: z.string().toLowerCase(),
    termId: z.number(),
})

// /api/v1/terms
termRouter.get(
    "/",
    jwt({secret: process.env.JWT_SECRET}),
    async (c) => {
        const payload = c.get("jwtPayload") 
        return c.json({ message: "Hello world posts", payload })
});

// /api/v1/terms/term-register
termRouter.post("/term-register", zValidator("json", registerTermSchema),
    async(c) => {
    
    const { content, userId } = await c.req.json();

    const [term] = await db
    .select()
    .from(termsTable)
    .where( eq(termsTable.content, content) )

    if (term) {
        return c.json({ message: "Term already registered" }, 400)
    }

    const newTerm = await db.insert(termsTable).values({
        content: content,
        userId,
    }).returning({
        id: termsTable.id,
        content: termsTable.content,
    })

    return c.json({newTerm})
})


// /api/v1/terms/image-register
termRouter.post("/image-register", zValidator("json", registerImageSchema),
    async(c) => {
    
    const { url, termId } = await c.req.json();

    const [term] = await db
    .select()
    .from(termsTable)
    .where( eq(termsTable.id, termId) )

    if (!term) {
        return c.json({ message: "No term" }, 400)
    }

    const newImage = await db.insert(imagesTable).values({
        url: url,
        termId: termId 
    }).returning({
        url: imagesTable.url,
        termId,
    })

    return c.json({newImage})
})
export default termRouter;