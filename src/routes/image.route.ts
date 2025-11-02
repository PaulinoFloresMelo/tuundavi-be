import { Hono } from "hono";

export const imageRouter = new Hono();

// /api/v1/images/:id
imageRouter.get(
    "/:image",
    async(c) => {

        const nameImage = c.req.param('image')
        const image = await Bun.file(`src/static/images/${nameImage}`)
        return new Response(image, {
            headers: {
            'Content-Type': 'image/jpeg',
            'Cache-Control': 'public, max-age=86400' // Cache por 1 día
            }
        })
    }
)


export default imageRouter;