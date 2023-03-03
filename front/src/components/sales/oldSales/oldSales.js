import { useEffect, useState } from "react";
import axios from "axios";
import SaleBack from "../saleBack";
import styles from "../../styles.module.css";
import Loading from "../../loading";
import SaleBar from "../newSale/saleBar";
import ListOldSales from "./ListOldSales";
import Sale from "../newSale/sale";
import StatsInputs from "../../stats/statsInputs"
import UpperBar from "../../upperBar.js/upperBar";
import { confirmAlert } from "react-confirm-alert";


export default function OldSales({ setMode, mode }) {

    const [oldSales, setOldSales] = useState("");
    const [loading, setLoading] = useState(true);

    // Create an state for editing mode
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // Create a calendar state for filtering Old Sales
    const [calendar, setCalendar] = useState(null);

    // Create a state for description when cancelling a sale
    const [saleCancel, setSaleCancel] = useState("");


    useEffect(() => {

        if (calendar) {

            axios
                .post(`${process.env.REACT_APP_URL}/sales/statistics`, calendar, {
                    headers: {
                        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
                        'Content-Type': 'application/json'
                    }
                })
                .then((response) => {
                    console.log(response)
                    setOldSales(response.data)
                })
                .catch((error) => {
                    console.log(error);
                })
                .finally(() => {
                    setLoading(false);
                })
        }

        else {

            axios
                .get(`${process.env.REACT_APP_URL}/Sales`, {
                    headers: {
                        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
                        'Content-Type': 'application/json'
                    }
                })
                .then((response) => {
                    console.log(response);
                    setOldSales(response.data)
                })
                .catch((error) => {
                    console.log(error);
                })
                .finally(() => {
                    setLoading(false);
                })


        }

    }, [calendar, isEditing])



    useEffect(() => {

        if (isEditing) {

            // Confirm CANCEL modal

            confirmAlert({
                customUI: ({ onClose }) => {
                    return (
                        <div className={styles.alertDescription}>
                            <div>                            <h1>Cancelar Venta</h1>
                                <div>
                                    <p>¿Está seguro de que desea cancelar esta venta?</p>
                                    <p>Por favor indique los motivos de la cancelación. Esta descripción quedará registrada</p>
                                </div>
                            </div>

                            <textarea

                                id="cancelDescription"
                                className={styles.textArea}
                                autoFocus
                                placeholder="Por favor indique los motivos de la cancelación"
                                minLength="20"
                                required

                            >
                            </textarea>

                            <div className={styles.buttonSet}>
                                <button
                                    onClick={() => {
                                        setEditingId("none");    
                                        setIsEditing(false);
                                        onClose()
                                    }}
                                    className={styles.buttonNo}>
                                    No
                                </button>
                                <button
                                    onClick={() => {
                                        setSaleCancel(document.getElementById("cancelDescription").value);
                                        handleCancelSale(editingId, saleCancel, onClose);

                                    }}
                                    className={styles.buttonYes}
                                >
                                    Si
                                </button>
                            </div>
                        </div>
                    );
                }
            });


        }


    }, [editingId])



    function handleCancelSale(id, description, onClose) {

        axios
            .delete(`${process.env.REACT_APP_URL}/Sales/${id}`, {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem("token")}`,
                    'Content-Type': 'application/json'
                }, description
            })

            .then((response) => {
                
                setIsEditing(false);
                setEditingId("null");

            })
            .catch((error) => {
                console.log(error);
            })
            .finally(() => {
                onClose()
            });
    }

    return (

        <div className={styles.centered}>

            <UpperBar setEsNuevo={null} sectionText="Ventas" buttonText={"Nueva Venta"} />

            {!loading ?

                <div>

                    <StatsInputs setCalendar={setCalendar} />

                    <SaleBar one="check" two="Código de Factura" three="Estado" four="Forma de Pago" five="Fecha" six="Monto" seven="Acción" />

                    <ListOldSales oldSales={oldSales} setIsEditing={setIsEditing} setEditingId={setEditingId} />

                    <SaleBack setMode={setMode} toMenu={true} setIsEditing={setIsEditing} />

                </div>

                :

                <Loading />}

        </div>
    )
}