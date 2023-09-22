let express = require("express");
let app = express();
let fs = require("fs");
app.use(express.json());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE, HEAD"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
app.use(readdata);
const port = process.env.PORT || 2410;
app.listen(port, () => console.log(`Node app listening on port ${port}!`));
const fname = "data.json";
let data={};
async function readdata(req,res,next){
  try{
    data = await fs.promises.readFile(fname,"utf8");
    data = JSON.parse(data);
  }
  catch(err){
    data = {};
  }
  next();
}
app.get("/products",function(req,res){
  res.send(data.products);
});
app.get("/products/category/:category",function(req,res){
    const {category} = req.params;
    const products = data.products.filter(p=>p.category===category);
    if(products)
      res.send(products);
    else
      res.status(404).send("Not Found");
});
app.get("/products/:id",function(req,res){
    const {id} = req.params;
      const product = data.products.find(p=>p.id==id);
      if(product)
        res.send(product);  
      else
        res.status(404).send("Not Found");
});
app.get("/orders",function(req,res){
  res.send(data.orders);
})
app.post("/products",async function(req,res){
    try{
      const product = req.body;
      let id = data.products.reduce((acc,curr)=>curr.id>acc?curr.id:acc,0) + 1;
      let newproduct = {id,...product};
      data.products.push(newproduct);
        data = JSON.stringify(data);
        await fs.promises.writeFile(fname,data);
        res.send(newproduct);
    }
    catch(err){
      res.status(401).send(err);
    }
});
app.post("/orders",async function(req,res){
  try{
    const order = req.body;
    console.log(order)
    data.orders.push(order);
    data = JSON.stringify(data);
    await fs.promises.writeFile(fname,data);
    console.log(order)
    res.send(order);
  }
  catch(err){
    res.status(401).send(err);
  }
});
app.post("/register",async function(req,res){
  try{
    const user = req.body;
    data.users.push(user);
    data = JSON.stringify(data);
    await fs.promises.writeFile(fname,data);
    res.send(user);
  }
  catch(err){
    res.status(401).send(err);
  }
});
app.post("/login",async function(req,res){
  const details = req.body;
  let user = data.users.find(u=>u.email==details.email&&u.password==details.password);
  if(user){
    res.send(user);
  }
  else{
    res.status(404).send("Not Found");
  }
})
app.put("/products/:id",async function(req,res){
  try{
    const {id} = req.params;
    const product = req.body;
    let updatedproduct = {id,...product};
    let index = data.products.findIndex(p=>p.id==id);
    data.products[index]=updatedproduct;
      data = JSON.stringify(data);
      await fs.promises.writeFile(fname,data);
      res.send(updatedproduct);
  }
  catch(err){
    res.status(404).send(err);
  }
});
app.delete("/products/:id",async function(req,res){
  try{
    const {id} = req.params;
    let index = data.products.findIndex(p=>p.id==id);
    data.products.splice(index,1);
    data = JSON.stringify(data);
    await fs.promises.writeFile(fname,data);
    res.send("Product Deleted");
  }
  catch(err){
    res.status(404).send(err);
  }
});