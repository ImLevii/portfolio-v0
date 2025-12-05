
import { db } from "@/lib/db"

async function main() {
    const product = await db.product.findUnique({
        where: {
            id: "cmis9k2z50000o51hqoq2thbk"
        }
    })
    console.log(product)
}

main()
