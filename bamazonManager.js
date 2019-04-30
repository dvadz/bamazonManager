var inquirer = require("inquirer");
var mysql = require("mysql");

var bamazonApp = {
    action:     " ",    //what user wants to do from the 4 options
    itemIndex: 0,       //array index of the item_id that was selected
    item_id: 0,         //database item_id of the item that was selected
    quantity: 0,        //quantity to be added to existing to the item_id
    response:   {},
    inventory : [],
}

function bamazonManager() {

    inquirer.prompt({
        type: "list",
        name: "action",
        message: "Manager Options",
        choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory",  "Add New Product"]
    }).then(function(answer){
        bamazonApp.action = answer.action;
        if(answer.action==="View Products for Sale") {
            viewProductsForSale();
        }else if(answer.action==="View Low Inventory") {
            viewLowInventory();
        }else if(answer.action==="Add to Inventory") {
            addToInventory();
        } else {        //"Add New Product"
            addNewProduct();
        }
    });
}

// "View Products for Sale" ======================================================
function viewProductsForSale() {
    //set the query
    let query = "SELECT * FROM products";
    //make the query
    makeAnSQLQuery(query);
}

function displayAllProducts() {
    //display the inventory
    console.table(bamazonApp.response);
}

// "View Low Inventory" =========================================================
function viewLowInventory() {
    //set the query
    let query = "SELECT * FROM products WHERE stock_quantity < 5";
    //make the query
    makeAnSQLQuery(query);
}

// "Add to Inventory" ===========================================================
function addToInventory() {
    //query all products like just in option1, for reference
    viewProductsForSale();
}

function askWhichProductToRestock() {
    //display the inventory just like in options1, for reference
    displayAllProducts();
    selectITem();
}

function selectITem(){
    //just creating some space
    console.log("");

    inquirer.prompt({
        type: "number",
        name: "itemID",
        message: "Please select from the 'item_id'?"
    })
    .then(function(answer){
        //user input is NOT a number
        if(isNaN(answer.itemID)){
            selectITem();
        
        //user input IS a number
        } else {
            // confirm that itemID exists
            let isItemIDValid = false;
            bamazonApp.response.forEach(function(item, index){
                if(answer.itemID===item.item_id) {
                    isItemIDValid = true;
                    bamazonApp.itemIndex = index;
                }
            });

            if(isItemIDValid){
                // save the itemID
                bamazonApp.item_id = answer.itemID;
                // show the name of the item that was selected
                console.log(` You picked: ${bamazonApp.response[bamazonApp.itemIndex].product_name}`);
                // ask for the quantity
                selectQuantity();
            } else {
                console.log("Item does not exist");
                selectITem();
            }
        }
    });
}

function selectQuantity(){
    //just creating some space
    console.log("");

    inquirer.prompt({
        type: "number",
        name: "quantity",
        message: "Please provide the quantity"
    })
    .then(function(answer){
        //user input is NOT a number
        if(isNaN(answer.quantity)){
            selectQuantity();
        //user input IS a number
        } else {
            bamazonApp.quantity = answer.quantity;
            // add the 'quantity' to the remaining quantity of 'item_id'
            bamazonApp.response[bamazonApp.itemIndex].stock_quantity += answer.quantity;
            let newQuantity = bamazonApp.response[bamazonApp.itemIndex].stock_quantity;
            // console.table(bamazonApp.response);
            // update the database
            let query = `UPDATE products SET stock_quantity = ${newQuantity} WHERE item_id = ${bamazonApp.item_id}`
            //clear the action to prevent a redirect
            bamazonApp.action = "";
            makeAnSQLQuery(query);
        }
    });
}

// "Add New Product" ===========================================
function addNewProduct() {

}

function makeAnSQLQuery(query) {

    // TODO: secure your password
    var connection = mysql.createConnection({
        host: "localhost",
        port: 3306,
        user: "root",
        password: "password",
        database: "bamazon"    
    });

    connection.connect(function(error){
        if(error) {
            console.log("ERROR setting up database connection");
            throw error;
        }
    
        connection.query(
            query, 
            function(error, response){
                if(error){
                    console.log(">>>> ERROR READING FROM DATABASE <<<<");
                    console.log(error.sql);
                    throw error;
                }

                //store the reponse
                bamazonApp.response = response;

                redirectAfterMakingTheQuery();
            }
        ); 
        connection.end();
    });

}

function redirectAfterMakingTheQuery(){

    if(bamazonApp.action==="View Products for Sale") {
        displayAllProducts();
    }else if(bamazonApp.action==="View Low Inventory") {
        displayAllProducts();
    }else if(bamazonApp.action==="Add to Inventory") {
        askWhichProductToRestock();
    } else if(bamazonApp.action==="Add New Product") {

    }
}

bamazonManager();