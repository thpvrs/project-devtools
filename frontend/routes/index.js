const express = require("express")
const path = require("path")
router = express.Router()
const pool = require("../config")
const multer = require('multer');
const upload = multer().array('images', 1); // 'images' should match the name attribute of the input field in the HTML form
const Jimp = require('jimp');

router.get("/", async function (req, res, next) {
    try {
        // const [rows, fields] = await pool.query("SELECT * FROM area")
        // const [camera] = await pool.query("SELECT * FROM `area` join camera using(place)")
        // return res.render("index", { area: JSON.stringify(rows) }, { cameras: JSON.stringify(camera) })

        const [area] = await pool.query("SELECT * FROM area")

        return res.render("index", { area: JSON.stringify(area) })
    } catch (err) {
        console.log(err)
        return next(err)
    }
})

// router.get("/main_operation", async function (req, res, next) {
//     try {
//         const [area] = await pool.query("SELECT * FROM area")
//         const query = 'SELECT * FROM mission ORDER BY date_time DESC;';
//         const [rows] = await pool.query(query);
//         const newItems = [];
//         for (let i = 0; i < rows.length; i++) {
//             const imgData = rows[i].img;
//             const img = await Jimp.read(imgData);
//             // Resize the image to 500px width
//             img.resize(500, Jimp.AUTO);
//             const imageBuffer = await img.getBufferAsync(Jimp.MIME_JPEG);
//             const new_row = {
//                 id: rows[i].id,
//                 name: rows[i].name,
//                 date_time: rows[i].date_time,
//                 camera_name: rows[i].camera_name,
//                 image: Buffer.from(imageBuffer).toString('base64'),
//                 status: rows[i].status
//             };
//             newItems.push(new_row);
//         }
//         console.log(area)
//         return res.render("main_operation", { area:area, items: newItems},)
//     } catch (err) {
//         console.log(err)
//         return next(err)
//     }
// })

router.get("/main_operation", async function (req, res, next) {
    try {
        const [area] = await pool.query("SELECT * FROM area")
        const [mission] = await pool.query("SELECT *,DATE_FORMAT(date_time, GET_FORMAT(DATETIME, 'ISO')) AS mission_date FROM `mission` join camera using(camera_name)")
        return res.render("main_operation", { area: JSON.stringify(area), mission: JSON.stringify(mission) },)
    } catch (err) {
        return next(err)
    }
})

router.get("/info_operation", async function (req, res, next) {
    try {
        const [rows, fields] = await pool.query("SELECT * FROM team")
        return res.render("info_operation", { teams: JSON.stringify(rows) })
    } catch (err) {
        console.log(err)
        return next(err)
    }
})

router.get("/select_team/:idmission", async function (req, res, next) {
    try {
        const [rows] = await pool.query("SELECT * FROM team", [req.params.idmission])
        const [mission] = await pool.query("SELECT *,DATE_FORMAT(date_time, GET_FORMAT(DATETIME, 'ISO')) AS mission_date FROM `mission` join camera using(camera_name) WHERE idmission=?", [req.params.idmission])
        return res.render("select_team", { teams: JSON.stringify(rows), mission: JSON.stringify(mission) },)
    } catch (err) {
        console.log(err)
        return next(err)
    }
})

router.get("/info_operation/:idmission", async function (req, res, next) {
    try {
        const [rows] = await pool.query("SELECT * FROM team", [req.params.idmission])
        const [mission] = await pool.query("SELECT *,DATE_FORMAT(date_time, GET_FORMAT(DATETIME, 'ISO')) AS mission_date FROM `mission` join camera using(camera_name) WHERE idmission=?", [req.params.idmission])
        return res.render("info_operation", { teams: JSON.stringify(rows), mission: JSON.stringify(mission) },)
    } catch (err) {
        return next(err)
    }
})

router.get('/addTeam/:name/:idmission', async function (req, res, next) {
    // console.log(req)
    const conn = await pool.getConnection()
    await conn.beginTransaction()
    try {
        const rows1 = await conn.query(
            'UPDATE `mission` SET name=?, status=? WHERE idmission=?', [req.params.name, "pass", req.params.idmission]
        )
        console.log(rows1)
        await conn.commit()
        res.redirect("/main_operation")
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
});

router.get('/delMis/:idmission', async function (req, res, next) {
    // console.log(req)
    const conn = await pool.getConnection()
    await conn.beginTransaction()
    try {
        const rows1 = await conn.query(
            'UPDATE `mission` SET status=? WHERE idmission=?', ["del", req.params.idmission]
        )
        console.log(rows1)
        await conn.commit()
        res.redirect("/main_operation")
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
});

router.get('/doneMis/:idmission', async function (req, res, next) {
    // console.log(req)
    const conn = await pool.getConnection()
    await conn.beginTransaction()
    try {
        const rows1 = await conn.query(
            'UPDATE `mission` SET status=? WHERE idmission=?', ["done", req.params.idmission]
        )
        console.log(rows1)
        await conn.commit()
        res.redirect("/main_operation")
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
});

router.get("/camera", async function (req, res, next) {
    try {
        return res.render("camera")
    } catch (err) {
        return next(err)
    }
});

router.post('/post_img', upload, async (req, res) => {

    const conn = await pool.getConnection()
    await conn.beginTransaction()

    try {
        const requestImages = req.files[0];
        console.log(requestImages);
        const image = requestImages.buffer;

        // Insert the image data into the database
        const nowStr = new Date().toISOString().slice(0, 19).replace('T', ' ');
        const query = 'INSERT INTO mission (date_time, camera_name, img, status, name) VALUES (?, ?, ?, null, null)';
        const [rows] = await conn.query(query, [nowStr, 'โรงอาหารไอที', '/uploads/1.png']);
        console.log(rows)
        await conn.commit()
        res.render('camera');
    } catch (e) {
        console.log(e);
        res.render('camera');
    }
});

router.get("/operation_history", async function (req, res, next) {
    try {
        const [area] = await pool.query("SELECT * FROM area")
        const [mission] = await pool.query("SELECT *,DATE_FORMAT(date_time, GET_FORMAT(DATETIME, 'ISO')) AS mission_date FROM `mission` join camera using(camera_name)")
        return res.render("operation_history", { area: JSON.stringify(area), mission: JSON.stringify(mission) },)
    } catch (err) {
        return next(err)
    }
})

exports.router = router