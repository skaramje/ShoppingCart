// sumulate getting products from DataBase
const products = [
    { name: "Apples", country: "Italy", cost: 3, instock: 10 },
    { name: "Oranges", country: "Spain", cost: 4, instock: 3 },
    { name: "Beans", country: "USA", cost: 2, instock: 5 },
    { name: "Cabbage", country: "USA", cost: 1, instock: 8 },
  ];
  //=========Cart=============
  const Cart = (props) => {
    const { Card, Accordion, Button } = ReactBootstrap;
    let data = props.location.data ? props.location.data : products;
    console.log(`data:${JSON.stringify(data)}`);
  
    return <Accordion defaultActiveKey="0">{list}</Accordion>;
  };
  
  const useDataApi = (initialUrl, initialData) => {
    const { useState, useEffect, useReducer } = React;
    const [url, setUrl] = useState(initialUrl);
  
    const [state, dispatch] = useReducer(dataFetchReducer, {
      isLoading: false,
      isError: false,
      data: initialData,
    });
    console.log(`useDataApi called`);
    useEffect(() => {
      console.log("useEffect Called");
      console.log(`useEffect called to fetch ${url}`);
      
      let didCancel = false;
      const fetchData = async () => {
        dispatch({ type: "FETCH_INIT" });
        try {
          const result = await fetch(url);
          const text = await result.text();
          const arr = JSON.parse(text);
          console.log("FETCH FROM URL");
          if (!didCancel) {
            dispatch({ type: "FETCH_SUCCESS", payload: arr.data });
          }
        } catch (error) {
          if (!didCancel) {
            dispatch({ type: "FETCH_FAILURE" });
          }
        }
      };
      fetchData();
      return () => {
        didCancel = true;
      };
    }, [url]);
    return [state, setUrl];
  };
  const dataFetchReducer = (state, action) => {
    switch (action.type) {
      case "FETCH_INIT":
        return {
          ...state,
          isLoading: true,
          isError: false,
        };
      case "FETCH_SUCCESS":
        return {
          ...state,
          isLoading: false,
          isError: false,
          data: action.payload,
        };
      case "FETCH_FAILURE":
        return {
          ...state,
          isLoading: false,
          isError: true,
        };
      default:
        throw new Error();
    }
  };
  
  const Products = (props) => {
    const [items, setItems] = React.useState(products);
    const [cart, setCart] = React.useState([]);
    const [total, setTotal] = React.useState(0);
    const {
      Card,
      Accordion,
      Button,
      Container,
      Row,
      Col,
      Image,
      Input,
    } = ReactBootstrap;
    //  Fetch Data
  
    
    console.log(`Items in Store: ${JSON.stringify(items)}`);
    console.log(`CartItems in Cart: ${JSON.stringify(cart)}`);
  
    const { Fragment, useState, useEffect, useReducer } = React;
    const [query, setQuery] = useState("http://localhost:1337/api/products");
    const [{ data, isLoading, isError }, doFetch] = useDataApi(
      "http://localhost:1337/api/products",
      {
        "data": [],
      }
    );
    console.log(`Data in database ${JSON.stringify(data)}`);
    // Fetch Data
    const addToCart = (e) => {
      let name = e.target.name;
      let item = items.filter((item) => item.name == name);
      if (item[0].instock == 0) return;
      item[0].instock = item[0].instock - 1;
      console.log(`add to Cart ${JSON.stringify(item)}`);
      setCart([...cart, ...item]);
    };
    const deleteCartItem = (delIndex) => {
      // this is the index in the cart not in the Product List
  
      let newCart = cart.filter((item, i) => delIndex != i);
      let target = cart.filter((item, index) => delIndex == index);
      let newItems = items.map((item, index) => {
        if (item.name == target[0].name) item.instock = item.instock + 1;
        return item;
      });
      setCart(newCart);
      setItems(newItems);
    };
    const photos = ["apple.png", "orange.png", "beans.png", "cabbage.png"];
  
    let list = items.map((item, index) => {
      //let n = index + 1049;
      //let uhit = "https://picsum.photos/" + n;
      
      const selectPhoto = (photos) => {
        if(item.name == 'Apples'){
          return photos[0];
        }else if (item.name == 'Oranges'){
          return photos[1];
        }else if (item.name == 'Beans'){
          return photos[2];
        }else if (item.name == 'Cabbage'){
          return photos[3];
        }else{
          return null;
        }
      }
      
      return (
        <li key={index}>
          
          <Image src={selectPhoto(photos)} width={70} roundedCircle></Image>
          <Button variant="primary" size="large">
            {item.name}:${item.cost}-Stock={item.instock}
          </Button>
          <input name={item.name} type="submit" onClick={addToCart}></input>
        </li>
      );
    });
    let cartList = cart.map((item, index) => {
      return (
        <Card key={index}>
          <Card.Header>
            <Accordion.Header eventkey={1 + index}>
              {item.name}
            </Accordion.Header>
          </Card.Header>
          <Accordion.Body
            onClick={() => deleteCartItem(index)}
            eventkey={1 + index}
          >
            <Card.Body>
              $ {item.cost} from {item.country}
            </Card.Body>
          </Accordion.Body>
        </Card>
      );
    });
  
    let finalList = () => {
      let total = checkOut();
      let final = cart.map((item, index) => {
        return (
          <div key={index} index={index}>
            {item.name}
          </div>
        );
      });
      return { final, total };
    };
  
    const checkOut = () => {
      let costs = cart.map((item) => item.cost);
      const reducer = (accum, current) => accum + current;
      let newTotal = costs.reduce(reducer, 0);
      console.log(`total updated to ${newTotal}`);
      //cart.map((item, index) => deleteCartItem(index));
      return newTotal;
    };
    
    const restockProducts = (url) => {
      
      doFetch(url);
      
      let allItems = data.map((item) => {
          let { name, country, cost, instock } = item.attributes;
          return { name, country, cost, instock };
      });
      
      let fruit = items.filter((item) => item.instock == 0);
      
      let newItems = allItems.filter((item) => item.name == fruit[0].name);
      
      setItems([...items, ...newItems]);
    };
    
    return (
      <Container>
        <Row>
          <Col>
            <h1>Product List</h1>
            <ul style={{ listStyleType: "none" }}>{list}</ul>
          </Col>
          <Col>
            <h1>Cart Contents</h1>
            <Accordion>{cartList}</Accordion>
          </Col>
          <Col>
            <h1>CheckOut </h1>
            <Button onClick={checkOut}>CheckOut $ {finalList().total}</Button>
            <div> {finalList().total > 0 && finalList().final} </div>
          </Col>
        </Row>
        <Row>
          <form
            onSubmit={(event) => {
              restockProducts(`${query}`);
              console.log(`Restock called on ${query}`);
              event.preventDefault();
            }}
          >
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <button type="submit">ReStock Products</button>
          </form>
        </Row>
      </Container>
    );
  };
  // ========================================
  ReactDOM.render(<Products />, document.getElementById("root"));
  