import styles from "../styles.module.css";
import { confirmAlert } from "react-confirm-alert";
import 'react-confirm-alert/src/react-confirm-alert.css';
import { useEffect, useState } from "react";
import axios from "axios";
import Loading from "../loading";
import PaginationList from "../pagination/paginationList";
import PaginationSelect from "../pagination/paginationSelect";


// A lista productos se le suma otro valor que es "isSelling". Si este valor es TRUE va a cambiar los botones de la derecha

export default function ListaProductos({ setForceRender, forceRender, value, categoryValue, categoriasDisponibles, setProductInfo, setEditMode, isSelling, setSaleStatus, saleStatus, goBack, setShowBars, productsTemp, setProductsTemp, setReverse, reverse }) {

    // Loading wheel
    const [loading, setLoading] = useState();

    // Data obtained from BackEnd
    const [datos, setDatos] = useState(null);

    // To check the filter result
    const [complete, setComplete] = useState([]);

    // Temporary added products
    const [addedList, setAddedList] = useState([]);

    // Disabled products
    const [disableList, setDisableList] = useState(saleStatus && saleStatus.map((item) => item.products._id) || null)

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(8);




    // Hook to load information from DataBase. It render again after deleting, editing or adding an item
    useEffect(() => {

        setAddedList(saleStatus && saleStatus.map((item) => item.products._id))

        setLoading(true);

        axios
            .get(`${process.env.REACT_APP_URL}/products`, {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem("token")}`,
                    'Content-Type': 'application/json'
                }
            })
            .then((response) => {
                setDatos(response.data);
                console.log(response.data)
            })
            .catch((error) => {
                console.log(error);
            })
            .finally(() => {
                setForceRender(false);
                setLoading(false);
                setShowBars(true);
            })


    }, [forceRender])

    // Filter data when changing search or category.
    useEffect(() => {

        if (datos) {
            setComplete(filtering(datos));
            setCurrentPage(1);
        }

    }, [value, categoryValue, datos])

    // Reverse when clicking on ORDENAR button
    useEffect(() => {

        if (reverse) {
            setComplete(complete.reverse())
            setReverse(false);

            console.log("reversing");
        }
        else {
            console.log("not working")
        }

    }, [reverse])



    // Filter function
    function filtering(data) {
        const temp = data.filter(product => product.name.toLowerCase().includes(value) && ((product.category === categoryValue || categoryValue === "All")));
        return temp;
    }

    // Delete function
    function handleDelete(id) {

        axios
            .delete(`${process.env.REACT_APP_URL}/products/${id}`, {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem("token")}`,
                    'Content-Type': 'application/json'
                }
            })
            .then((response) => {
                console.log(response)
            })
            .catch((error) => {
                console.log(error);
            })
            .finally(() => setForceRender(true))
    }

    // Confirm delete function
    function handleAlert(id) {


        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <div className={styles.alert}>
                        <h1>Elminar Producto</h1>
                        <p>¿Está seguro de que desea eliminar este producto?</p>
                        <button className={styles.buttonNo} onClick={onClose}>No</button>
                        <button
                            onClick={() => {
                                handleDelete(id);
                                onClose();
                            }}
                            className={styles.buttonYes}
                        >
                            Yes
                        </button>
                    </div>
                );
            }
        });

    }

    // Turns on Edit Mode on parent component
    function handleEdit(id, category, name, price, image) {
        console.log("editing");
        setEditMode(true);
        setProductInfo({
            id: id,
            category: category,
            name: name,
            price: price,
            image: image
        });

    }

    async function handleAdd(name, price, id, cat) {
        /*
        console.log(saleStatus);
        const sale = [...saleStatus];
        const newProduct = {
            products:
            {
                _id: id,
                name: name,
                price: price,
                quantity: 1,
            }

            ,
            total() { return this.products.price * this.products.quantity },

        }

        const elementIndex = sale.indexOf(sale.find(element => element.products._id === id));

        if (elementIndex === -1) {
            sale.push(newProduct);
            setSaleStatus(sale);
            console.log("here");
            goBack();
        }
        else {
            sale[elementIndex].products.quantity++;
            setSaleStatus(sale);
            goBack();
        }
*/

        const sale = [...productsTemp];
        console.log(sale)

        // create a product

        const newProduct = {
            products:
            {
                _id: id,
                name: name,
                price: price,
                quantity: 1,
                category: cat
            }

            ,
            total() { return (this.products.price * this.products.quantity) },

        }


        const elementIndex = sale.indexOf(sale.find(element => element.products._id === id));
        console.log(elementIndex);
        console.log(sale)

        if (elementIndex === -1) {

            // Add the product to the temp array
            sale.push(newProduct);
            setProductsTemp(sale);

            // Add the product the the temporary added list
            const added = [...addedList];
            added.push(id);
            setAddedList(added);
            console.log(sale);
        }

        else {
            // Delete the product from temporary product list
            sale.splice(elementIndex, 1);
            setProductsTemp(sale);

            // Delete product from added List
            const added = [...addedList];
            added.splice(added.indexOf(id), 1);
            setAddedList(added);


        }


    }


    return (

        !loading

            ?

            <>
                <PaginationList
                    data={complete}
                    state={isSelling}
                    handleAdd={handleAdd}
                    handleEdit={handleEdit}
                    handleAlert={handleAlert}
                    currentPage={currentPage}
                    itemsPerPage={itemsPerPage}
                    goBack={goBack}
                    isSale={false}
                    addedList={addedList}
                    disableList={disableList}
                    categoriasDisponibles={categoriasDisponibles}
                />

                <PaginationSelect
                    itemsPerPage={itemsPerPage}
                    setCurrentPage={setCurrentPage}
                    totalItems={complete.length}
                    currentPage={currentPage}

                />

            </>
            :

            <Loading />

    )
}