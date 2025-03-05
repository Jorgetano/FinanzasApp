import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Keyboard, Alert } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons"; // Asegúrate de instalar este paquete
import CustomKeyboard from "./CustomKeyboard"; // Importa el teclado personalizado

const CategoryButton = ({ iconName, label, onPress, isSelected }) => (
  <TouchableOpacity onPress={onPress} style={styles.iconButton}>
    <View style={[styles.circle, isSelected && styles.selectedCircle]}>
      <Icon name={iconName} size={30} color="#6200EE" />
    </View>
    <Text style={styles.iconText}>{label}</Text>
  </TouchableOpacity>
);

export default function HomeScreen() {
  const [selectedIcon, setSelectedIcon] = useState(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const handleIconPress = (iconName) => {
    setSelectedIcon(iconName);
    Keyboard.dismiss(); // Cierra el teclado si está abierto
  };

  const handleKeyPress = (key) => {
    if (key === '⌫') {
      setAmount(amount.slice(0, -1)); // Elimina el último carácter
    } else {
      setAmount(amount + key); // Agrega el carácter al monto
    }
  };

  const handleCancel = () => {
    setSelectedIcon(null);
    setAmount("");
    setNote("");
    Keyboard.dismiss();
  };

  const handleAdd = () => {
    if (!amount || isNaN(amount)) {
      Alert.alert("Error", "Por favor ingresa un monto válido.");
      return;
    }

    // Aquí puedes manejar la lógica para guardar el gasto
    console.log(`Gasto en ${selectedIcon}: $${amount}, Nota: ${note}`);
    Alert.alert("Éxito", `Gasto en ${selectedIcon} guardado: $${amount}`);

    // Limpiar el estado
    setSelectedIcon(null);
    setAmount("");
    setNote("");
    Keyboard.dismiss();
  };

  const handleToday = () => {
    Alert.alert("Hoy", "Se ha seleccionado la fecha de hoy.");
  };

  const handlePlus = () => {
    Alert.alert("+", "Acción de suma.");
  };

  const handleMinus = () => {
    Alert.alert("-", "Acción de resta.");
  };

  const handleCheck = () => {
    Alert.alert("✓", "Acción de confirmación.");
  };

  const handleClear = () => {
    setAmount("");
  };

  const categories = [
    { icon: "shopping-cart", label: "Compras" },
    { icon: "local-dining", label: "Alimentos" },
    { icon: "smartphone", label: "Telefono" },
    { icon: "directions-car", label: "Transporte" },
    { icon: "school", label: "Educación" },
    { icon: "checkroom", label: "Ropa" },
    { icon: "home", label: "Hogar" },
    { icon: "flight", label: "Viaje" },
    { icon: "local-hospital", label: "Salud" },
    { icon: "spa", label: "Belleza" },
    { icon: "devices", label: "Electrónicos" },
    { icon: "local-grocery-store", label: "Víveres" },
    { icon: "card-giftcard", label: "Regalos" },
    { icon: "build", label: "Reparaciones" },
    { icon: "pets", label: "Mascota" },
    { icon: "sports-esports", label: "Ocio" },
    { icon: "fitness-center", label: "Deportes" },
    { icon: "local-movies", label: "Cine" },
    { icon: "restaurant", label: "Restaurantes" },
    { icon: "security", label: "Seguros" },
    { icon: "savings", label: "Ahorros" },
    { icon: "more-horiz", label: "Otros" }
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Egresos</Text>

      <View style={styles.iconContainer}>
        {categories.map((category) => (
          <CategoryButton
            key={category.icon}
            iconName={category.icon}
            label={category.label}
            onPress={() => handleIconPress(category.icon)}
            isSelected={selectedIcon === category.icon}
          />
        ))}
      </View>

      {selectedIcon && (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Ingrese el monto"
            placeholderTextColor="#999999"
            value={amount}
            editable={false} // Desactiva el teclado predeterminado
          />
          <TextInput
            style={styles.noteInput}
            placeholder="Introduce una nota..."
            placeholderTextColor="#999999"
            value={note}
            onChangeText={setNote}
          />
          <CustomKeyboard
            onKeyPress={handleKeyPress}
            onCancel={handleCancel}
            onAdd={handleAdd}
            onToday={handleToday}
            onPlus={handlePlus}
            onMinus={handleMinus}
            onCheck={handleCheck}
            onClear={handleClear}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#121212", padding: 20 },
  title: { color: "#FFFFFF", fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  iconContainer: { flexDirection: "row", justifyContent: "space-around", width: "100%", marginBottom: 20, flexWrap: "wrap" },
  iconButton: { alignItems: "center", width: "25%", marginBottom: 20 },
  circle: { width: 60, height: 60, borderRadius: 30, backgroundColor: "#FFFFFF", justifyContent: "center", alignItems: "center", marginBottom: 5 },
  selectedCircle: { borderWidth: 2, borderColor: "#6200EE" },
  iconText: { color: "#FFFFFF", fontSize: 14, marginTop: 5, textAlign: "center" },
  inputContainer: { width: "100%", alignItems: "center" },
  input: { height: 50, width: "100%", borderColor: "#6200EE", borderWidth: 1, borderRadius: 10, paddingHorizontal: 15, color: "#FFFFFF", marginBottom: 15, fontSize: 16 },
  noteInput: { height: 50, width: "100%", borderColor: "#6200EE", borderWidth: 1, borderRadius: 10, paddingHorizontal: 15, color: "#FFFFFF", marginBottom: 15, fontSize: 16 },
});