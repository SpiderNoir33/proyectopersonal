import { useCallback, useEffect, useRef, useState } from "react";
import * as productsApi from "../api/products.js";
import { apiErrorMessage } from "../utils/errors.js";

export function useProducts(params = {}) {
  const key = JSON.stringify(params);
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const alive = useRef(true);

  const load = useCallback(
    (pageNum, append) => {
      setLoading(true);
      setError(null);
      productsApi
        .list({ ...JSON.parse(key), page: pageNum })
        .then((res) => {
          if (!alive.current) return;
          const { products = [], total = 0, page = 1, pages = 1 } = res.data;
          setItems((prev) => (append ? [...prev, ...products] : products));
          setMeta({ total, page, pages });
        })
        .catch((err) => {
          if (!alive.current) return;
          setError(apiErrorMessage(err));
        })
        .finally(() => {
          if (alive.current) setLoading(false);
        });
    },
    [key]
  );

  useEffect(() => {
    alive.current = true;
    load(1, false);
    return () => {
      alive.current = false;
    };
  }, [load]);

  const loadMore = () => {
    if (loading) return;
    // pagina siguiente segun lo que diga el servidor, no un contador local
    load(meta.page + 1, true);
  };
  const hasMore = meta.page < meta.pages;

  return { items, meta, loading, error, reload: () => load(1, false), loadMore, hasMore };
}
