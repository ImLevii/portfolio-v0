
import { db } from "@/lib/db"

async function main() {
    await db.product.update({
        where: {
            id: "cmis9k2z50000o51hqoq2thbk"
        },
        data: {
            price: 0
        }
    })
    console.log("Product price updated to 0")
}

main()
