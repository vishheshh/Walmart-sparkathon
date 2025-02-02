const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const categoryRouter = require("./Routers/Category");
const colorRouter = require("./Routers/Colors");
const productRouter = require("./Routers/Product");
const userRouter = require("./Routers/user");
const cartRouter = require("./Routers/cart");
const orderRouter = require("./Routers/order");
const stackRoutes = require("./Routers/stack");
const AdminAuth = require("./middleware/adminAuth");
const cookieParser = require("cookie-parser");
const brandRouter = require("./Routers/Brand");
const startCsvWatcher = require("./updateMongoFromCsv");
const freqRouter = require("./Routers/freq");
const fs = require("fs");
const app = express();

//app.use(express.json()); will work when we are sending json files but as we are submitting a form containing image we need to install fileUpload package (done on router page)
app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
//now in order to make the pictures in the public folder usable in the frontend , we need to tell the server to surf the folder as per the request
app.use(express.static("Public"));

app.use("/category", categoryRouter);
app.use("/colors", colorRouter);
app.use("/brand", brandRouter);
app.use("/product", productRouter);
app.use("/user", userRouter);
app.use("/cart", cartRouter);
app.use("/order", orderRouter);
app.use("/api/stacks", stackRoutes);
app.use("/freq", freqRouter);
const bodyParser = require("body-parser");
const path = require("path");
app.use(bodyParser.json());
// MongoDB connection
const uri = 'mongodb://localhost:27017';
const dbName = "WalmartDataBase";
const collectionName = "csvSync";
const csvFilePath = "./transformed_stacks_people_per_minute.csv";

// Connect to MongoDB and start the CSV watcher
startCsvWatcher(uri, dbName, collectionName, csvFilePath);

app.post("/save-date", (req, res) => {
  const { date, productName } = req.body;

  if (!date || !productName) {
    return res
      .status(400)
      .json({ error: "Date and Product Name are required" });
  }

  // Remove hyphens from the date
  const formattedDate = date.replace(/-/g, "");

  const dataToWrite = `${formattedDate}_${productName}`;

  fs.writeFile(
    path.join(__dirname, "/selected-date.txt"),
    dataToWrite,
    (err) => {
      if (err) {
        return res
          .status(500)
          .json({ error: "Failed to write date and product name to file" });
      }
      res
        .status(200)
        .json({ message: "Date and Product Name saved successfully" });
    }
  );
});


app.get(
  "/test",
  //req ke beech me admin auth middleware add kara
  AdminAuth,
  (req, res) => {
    res.send("You are authenticated and have access to this route");
  }
);

// MongoDB connection
mongoose
  .connect("mongodb://localhost:27017/", {
    dbName: "WalmartDataBase",
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
  })
  .then((result) => {
    app.listen(5000, () => console.log("server listening on port 5000"));
  })
  .catch((err) => {
    console.log("connection failed");
  });

