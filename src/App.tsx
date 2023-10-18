import React, { useState, useEffect } from "react";
import { Input, Spin, Empty } from "antd";
import debounce from "lodash/debounce";
import "./App.css";

type ProductType = {
  id: string;
  title: string;
  thumbnail: string;
  price: number;
};

type DataResponse = {
  products?: ProductType[];
  total?: number;
  skip?: number;
  limit?: number;
};

function App() {
  const limit: number = 20;
  const [products, setProducts] = useState<ProductType[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [skip, setSkip] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadMore, setLoadMore] = useState<boolean>(false);
  const [search, setKeyword] = useState<string>("");

  useEffect(() => {
    setLoading(true);
    getListProduct(search, 0);
  }, []);

  useEffect(() => {
    if (products && products.length) {
      setSkip(products.length);
    }
  }, [products]);

  //action

  const getListProduct = (keyword: string, skip: number) => {
    let apiUrl = "https://dummyjson.com/products";
    if (keyword != "") {
      apiUrl = "https://dummyjson.com/products/search";
    }
    let params: any = {
      limit,
      skip,
      q: keyword,
    };
    const url = new URL(apiUrl);
    url.search = new URLSearchParams(params).toString();
    fetch(url)
      .then((response) => response.json())
      .then((data: DataResponse) => {
        if (data && data.products) {
          let ndata = [...data.products];
          if (skip > 0) {
            ndata = products.concat(data.products);
          }
          setProducts(ndata);
          setTotal(data.total || 0);
        }
        setLoading(false);
        setLoadMore(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };

  const onScroll = (event: React.UIEvent) => {
    const target = event.target as HTMLElement;
    if (target.scrollTop + target.offsetHeight === target.scrollHeight) {
      if (total && products && products.length < total && !loadMore) {
        setLoadMore(true);
        getListProduct(search, skip);
      }
    }
  };

  const debounceSearch = debounce((value) => {
    setKeyword(value);
    setSkip(0);
    setLoading(true);
    getListProduct(value, 0);
  }, 1000);

  //render

  const renderItem = (item: ProductType) => {
    return (
      <div className="item-container">
        <img className="image" src={item.thumbnail} />
        <span className="title">{item.title || ""}</span>
        <span className="price">{item && item.price ? item.price : 0}$</span>
      </div>
    );
  };

  const renderListProduct = () => {
    if (!products) return null;

    return (
      <div className="list-product-content" onScroll={onScroll}>
        {products.map((item) => renderItem(item))}
      </div>
    );
  };

  return (
    <div className="product-list">
      <div className="header">
        <h2 className="title">Danh sách sản phẩm</h2>
        <div className="filter">
          <Input
            placeholder="Nhập từ khóa"
            onChange={(e) => debounceSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="product-list-container">
        {loading ? (
          <div className="empty">
            <Spin />
          </div>
        ) : products && products.length > 0 ? (
          renderListProduct()
        ) : (
          <div className="empty">
            <Empty />
          </div>
        )}
        {loadMore ? (
          <div className="custom-load-more">
            <Spin />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default App;
