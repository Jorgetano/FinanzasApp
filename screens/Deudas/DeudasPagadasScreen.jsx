import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    Image,
    TouchableOpacity,
} from "react-native";
import { getDocs, collection } from "firebase/firestore";
import { db } from "../../credenciales"; // Asegúrate de que la ruta sea correcta

const DeudasPagadasScreen = ({ refresh }) => {
    const [deudasPagadas, setDeudasPagadas] = useState([]);

    useEffect(() => {
        fetchDeudasPagadas();
    }, [refresh]); // Escucha cambios en `refresh`

    const fetchDeudasPagadas = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "DeudasPagadas"));
            const deudas = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setDeudasPagadas(deudas);
        } catch (error) {
            console.error("Error al obtener las deudas pagadas:", error);
        }
    };

    const renderItem = ({ item }) => {
        const borderColor = item.atrasado === "Sí" ? "#E74C3C" : "#3498DB"; // Color condicional

        return (
            <TouchableOpacity onPress={() => { }}>
                <View style={styles.itemContainer}>
                    <Text style={styles.itemText2}> {item.fechaInicio}</Text>
                    <View
                        style={[
                            styles.item,
                            {
                                borderLeftColor: borderColor, // Color condicional
                            },
                        ]}
                    >
                        {item.imagen && (
                            <Image
                                source={item.imagen}
                                style={styles.entityImage}
                                resizeMode="contain"
                            />
                        )}
                        <View style={styles.itemContent}>
                            <Text style={styles.itemText}>
                                <Text style={styles.itemTextLabel}>Deuda Total: </Text>
                                <Text style={styles.itemTextValue}>
                                    ${parseFloat(item.deudaTotal).toLocaleString("es-ES", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}
                                </Text>
                            </Text>
                            <Text style={styles.itemText}>
                                <Text style={styles.itemTextLabel}>Valor Cuota: </Text>
                                <Text style={styles.itemTextValue}>
                                    ${parseFloat(item.valorCuota).toLocaleString("es-ES", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}
                                </Text>
                            </Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.listContainer}>
            <Text style={styles.title}>Deudas Pagadas</Text>
            <FlatList
                data={deudasPagadas}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    listContainer: { flex: 1, marginTop: -7 },
    itemContainer: { marginBottom: 10 },
    item: { backgroundColor: "#FFFFFF", padding: 15, borderRadius: 10, flexDirection: "row", alignItems: "center", borderLeftWidth: 15, borderLeftColor: "#3498DB", shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
    entityImage: { width: 50, height: 50, marginRight: 15, borderRadius: 5 },
    itemContent: { flex: 1 },
    itemText: { fontSize: 14, color: "#2C3E50", marginBottom: 5 },
    itemTextLabel: { fontSize: 14, color: "#34495E" },
    itemTextValue: { fontSize: 14, color: "#2C3E50", fontWeight: "bold" },
    itemText2: { position: "relative", marginLeft: "33%", fontSize: 16, color: "#2C3E50", flex: 1, left: 16, top: 10, transform: [{ translateY: -5 }], zIndex: 1, width: 90, borderWidth: 1, borderColor: "#ffff", borderRadius: 5, backgroundColor: "#ffff", shadowColor: "#000", shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 3 },
    title: { fontSize: 22, fontWeight: "bold", marginBottom: 10, textAlign: "center", color: "#2C3E50" },
});

export default DeudasPagadasScreen;