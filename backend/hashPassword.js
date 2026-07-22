const bcrypt = require("bcryptjs");

const password = "Akosimolly2402.";

async function generateHash() {

    try {

        const hash = await bcrypt.hash(password, 10);

        console.log("\nHashed Password:\n");
        console.log(hash);

    } catch (err) {

        console.error(err);

    }

}

generateHash();