import { useEffect, useState } from "react";
import Button from "../ui/Button.jsx";
import Input from "../ui/Input.jsx";

// DEMO: los datos de la tarjeta viven solo en el estado de React de esta
// pestaña — ni console.log, ni localStorage, ni fetch. En un checkout real
// NUNCA se toca la tarjeta con código propio: se usa Stripe Elements o el
// SDK de PayPal y la confirmación llega por webhook al servidor.
export default function CardForm({ onSubmit, busy }) {
  const [card, setCard] = useState({ numero: "", exp: "", cvv: "" });

  // Limpia los campos al salir de la página
  useEffect(
    () => () => setCard({ numero: "", exp: "", cvv: "" }),
    []
  );

  const onChange = (e) => {
    const { name } = e.target;
    let value = e.target.value;

    if (name === "numero") {
      value = value
        .replace(/\D/g, "")
        .slice(0, 16)
        .replace(/(\d{4})(?=\d)/g, "$1 ");
    }
    if (name === "exp") {
      const digits = value.replace(/\D/g, "").slice(0, 4);
      value = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
    }
    if (name === "cvv") {
      value = value.replace(/\D/g, "").slice(0, 4);
    }

    setCard((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmitForm = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={onSubmitForm} className="flex flex-col gap-4">
      <Input
        id="numero"
        name="numero"
        label="Número de tarjeta"
        inputMode="numeric"
        autoComplete="off"
        placeholder="4242 4242 4242 4242"
        value={card.numero}
        onChange={onChange}
      />
      <div className="grid grid-cols-2 gap-4">
        <Input
          id="exp"
          name="exp"
          label="MM/AA"
          inputMode="numeric"
          autoComplete="off"
          placeholder="12/28"
          value={card.exp}
          onChange={onChange}
        />
        <Input
          id="cvv"
          name="cvv"
          label="CVV"
          type="password"
          inputMode="numeric"
          autoComplete="off"
          placeholder="123"
          value={card.cvv}
          onChange={onChange}
        />
      </div>
      <p className="text-xs text-dim">
        Demo: estos datos no se envían a ningún servidor ni se guardan.
      </p>
      <Button type="submit" disabled={busy}>
        {busy ? "Procesando..." : "Pagar (simulado)"}
      </Button>
    </form>
  );
}
