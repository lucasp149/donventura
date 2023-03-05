import { useEffect, useState } from "react";
import styles from "../../styles.module.css";
import SaleBack from "../saleBack";
import SaleBar from "./saleBar";
import SaleDetails from "./saleDetails";
import Loading from "../../loading";
import axios from "axios";
import Success from "../../success";




export default function Sale({ setMode, isEditing, isEditingId, setIsEditing }) {


    const [load, setLoad] = useState(false);
    const [success, setSuccess] = useState(false);
    const [forceRender, setForceRender] = useState(false);



    // We create a Sale  Status to register the products on current sale 
    const [saleStatus, setSaleStatus] = useState([]);



    // If we are editing a Sale, load the current sale information
    useEffect(() => {

        if (isEditing) {

            var sale;

            axios
                .get(`${process.env.REACT_APP_URL}/Sales/${isEditingId}`, {
                    headers: {
                        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
                        'Content-Type': 'application/json'
                    }
                })
                .then((response) => {
                    console.log(response.data);
                    // sale recieves the products array
                    sale = response.data;
                    console.log(sale);

                    // Then i map sale and create, for each product, an object with this format: {products: [], total:()}
                    sale.products.map((item) => (
                        item.products = { name: item.name, price: item.price, quantity: item.quantity },
                        item.total = () => { return item.products.price * item.products.quantity }
                    ))
                    console.log(sale);
                    setSaleStatus(sale.products);
                })
                .catch((error) => {
                    console.log(error);
                })
                .finally(() => {

                    console.log(saleStatus)
                    setLoad(false)

                });
        }
    }, [])



    return (

        !success ?

            !load ?

                <div className={styles.centered}>

                    {
                        <>
                            {!isEditing ? <h3>NUEVA VENTA</h3> : <h3>VER VENTA</h3>}

                            <SaleBar one="Nombre" two="Precio" three="Cantidad" four="TOTAL" />
                            <SaleDetails setForceRender={setForceRender} forceRender={forceRender} saleStatus={saleStatus} setSaleStatus={setSaleStatus} isEditing={isEditing} setMode={setMode} isEditingId={isEditingId} setSuccess={setSuccess} />
                            <SaleBack setMode={setMode} isEditing={isEditing} setIsEditing={setIsEditing} />

                        </>

                    }

                </div>

                :

                <Loading />
            :

            <Success operacion="Venta" setSuccess={setSuccess} setMode={setMode} setIsEditing={setIsEditing}/>
    )
}