import { Hono } from "hono";
import { z } from "zod";
import { eq } from 'drizzle-orm';
import { db } from '../db/index';
import { zValidator } from '@hono/zod-validator';
import { validator } from 'hono/validator';
import { termsTable } from "../db/schema";

export const termRouter = new Hono();

const queryValidation = validator('query', (value, c) => {
  const offset = Number(value?.offset) || 0;
  const limit = Number(value?.limit) || 99;
  const category = String(value?.category ?? '');

  if (isNaN(offset) || offset < 0) return c.json({ error: 'Offset inválido' }, 400);
  if (isNaN(limit) || limit > 100) return c.json({ error: 'Límite excede el máximo' }, 400);
  if (category === "undefined" ) return c.json({ error: 'Categoría inválida' }, 400);

  return { offset, limit, category };
});

if (!process.env.JWT_SECRET){
    throw new Error("Missing JWT_SECRET");    
}

const registerTermSchema = z.object({
    content: z.string().trim().toLowerCase(),
    imageUrl: z.string().trim().toLowerCase(),
    audioUrl: z.string().trim().toLowerCase(),
    example: z.string().trim().toLowerCase(),
    category: z.string().trim().toLowerCase(),
    userId: z.number(),
})


// /api/v1/terms
// /api/v1/terms?category=animales&page=1&limit=30    opcional la category, page y limit, por defecto category='' y limit=99
termRouter.get(
    "/",
    queryValidation,
    async(c) => {
        const { offset, limit, category } = c.req.valid('query');

        if (category.length !== 0) {
            const [terms, total] = await Promise.all([

            db.select()
            .from(termsTable)
            .limit(limit)
            .offset(offset)
            .where(eq(termsTable.category, category)),
            
            db.select()
            .from(termsTable)
        ]);
        return c.json({
            count: total.length, totalPages: Math.ceil(total.length / limit), terms}) 
        }

        const [terms, total] = await Promise.all([

            db.select()
            .from(termsTable)
            .limit(limit)
            .offset(offset),
            
            db.select()
            .from(termsTable)
        ]);

        return c.json({
            count: total.length, pages: Math.ceil(total.length / limit), terms})         
});


// /api/v1/terms/:id
termRouter.get(
    "/:id",
    async(c) => {
        const id = c.req.param('id')
        
        const term = await db
        .select()
        .from(termsTable)
        .where(eq(termsTable.id, parseInt(id)))

        return c.json(term[0])
});

// /api/v1/terms/term-register
termRouter.post("/term-register", zValidator("json", registerTermSchema),
    async(c) => {
    
    const { 
        content, 
        imageUrl,
        audioUrl,
        example,
        category,
        userId,  } = await c.req.json();

    const [term] = await db
    .select()
    .from(termsTable)
    .where( eq(termsTable.content, content) )

    if (term) {
        return c.json({ message: "Term already registered" }, 400)
    }

    const newTerm = await db.insert(termsTable).values({
        content: content,
        imageUrl: imageUrl,
        audioUrl: audioUrl,
        example: example,
        category: category,
        userId: userId,
    }).returning({
        id: termsTable.id,
        content: termsTable.content,
        imageUrl: termsTable.imageUrl,
        audioUrl: termsTable.audioUrl,
        example: termsTable.example,
        category: termsTable.category,
        userId: termsTable.userId,
    })

    return c.json({newTerm})
})

// /api/v1/terms/seed-terms
termRouter.post("/seed-terms",
    async(c) => {

    const sampleTerms = [
        {
            "content": "Test 1",
            "imageUrl": "298773.jpg",
            "audioUrl": "731909",
            "example": "example",
            "category": "adverbio",
            "userId": 1,
        },
        {
            "content": "Test 2",
            "imageUrl": "298773.jpg",
            "audioUrl": "731909",
            "example": "example",
            "category": "adverbio",
            "userId": 1,
        },
        {
            "content": "Test 3",
            "imageUrl": "298773.jpg",
            "audioUrl": "731909",
            "example": "example",
            "category": "adverbio",
            "userId": 1,
        },
        {
            "content": "Test 4",
            "imageUrl": "298773.jpg",
            "audioUrl": "731909",
            "example": "example",
            "category": "adverbio",
            "userId": 1,
        },
        {
            "id": 5,
            "content": "Test 5",
            "imageUrl": "298773.jpg",
            "audioUrl": "731909",
            "example": "example",
            "category": "animales",
            "userId": 1,
        },
        {
            "content": "Test 6",
            "imageUrl": "298773.jpg",
            "audioUrl": "731909",
            "example": "example",
            "category": "animales",
            "userId": 1,
        },
        {
            "content": "Test 7",
            "imageUrl": "298773.jpg",
            "audioUrl": "731909",
            "example": "example",
            "category": "animales",
            "userId": 1,
        },
        {
            "content": "Test 8",
            "imageUrl": "298773.jpg",
            "audioUrl": "731909",
            "example": "example",
            "category": "animales",
            "userId": 1,
        },
        {
            "content": "Test 9",
            "imageUrl": "298773.jpg",
            "audioUrl": "731909",
            "example": "example",
            "category": "animales",
            "userId": 1,
        },
        {
            "content": "Test 10",
            "imageUrl": "298773.jpg",
            "audioUrl": "731909",
            "example": "example",
            "category": "colores",
            "userId": 1,
        },
        {
            "content": "Test 11",
            "imageUrl": "298773.jpg",
            "audioUrl": "731909",
            "example": "example",
            "category": "colores",
            "userId": 1,
        },
        {
            "content": "Test 12",
            "imageUrl": "298773.jpg",
            "audioUrl": "731909",
            "example": "example",
            "category": "colores",
            "userId": 1,
        },
        {
            "content": "Test 13",
            "imageUrl": "298773.jpg",
            "audioUrl": "731909",
            "example": "example",
            "category": "colores",
            "userId": 1,
        },
        {
            "content": "Test 14",
            "imageUrl": "298773.jpg",
            "audioUrl": "731909",
            "example": "example",
            "category": "colores",
            "userId": 1,
        },
        {
            "content": "Test 15",
            "imageUrl": "298773.jpg",
            "audioUrl": "731909",
            "example": "example",
            "category": "colores",
            "userId": 1,
        }
    ] 

    try {
        const newTerms = await db.insert(termsTable).values(sampleTerms)
        return c.json({newTerms})
    } catch (error) {
    console.error('Error durante el seeding:', error);
    process.exit(1);
  }

})

export default termRouter;