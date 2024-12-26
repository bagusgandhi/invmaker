import { SignedIn, useClerk } from "@clerk/clerk-expo";
import {
  Dimensions,
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  Button,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import Modal from "react-native-modal";
import { SafeAreaView } from "react-native-safe-area-context";
import { generateInvoiceNumber } from "@/utils/invoice";
import { useEffect, useState } from "react";
const { width, height } = Dimensions.get("window");
import { useRouter } from "expo-router";
import { Octicons } from "@expo/vector-icons";
import { supabase } from "@/utils/supabase";
import { formatCurrency } from "@/utils/currency";

const CreateInvoiceScreen = () => {
  const { signOut, user } = useClerk();
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [customerName, setCustomerName] = useState<string>("");
  const [customerAddress, setCustomerAddress] = useState<string>("");
  const [items, setItems] = useState<
    { name: string; price: string; quantity: string }[]
  >([]);
  const [itemNameTemp, setItemNameTemp] = useState<string>("");
  const [itemPriceTemp, setItemPriceTemp] = useState<number>(0);
  const [itemQuantityTemp, setItemQuantityTemp] = useState<number>(1);
  const [invoiceStatus, setInvoiceStatus] = useState<string>("unpaid");
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading indicator state

  useEffect(() => {
    const generatedInvoice = generateInvoiceNumber();
    setInvoiceNumber(generatedInvoice);
  }, []);

  const handleAddItem = () => {
    if (itemNameTemp && itemPriceTemp > 0 && itemQuantityTemp > 0) {
      setItems([
        ...items,
        {
          name: itemNameTemp,
          price: itemPriceTemp.toString(),
          quantity: itemQuantityTemp.toString(),
        },
      ]);
      setItemNameTemp("");
      setItemPriceTemp(0);
      setItemQuantityTemp(1);
      setModalVisible(false);
    } else {
      alert("Please fill all item fields correctly.");
    }
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const totalAmount = items.reduce(
      (total, item) =>
        total + parseFloat(item.price) * parseInt(item.quantity),
      0
    );

    const { data, error } = await supabase
      .from("invoice")
      .insert([
        {
          invoice: invoiceNumber,
          customer_name: customerName,
          address: customerAddress,
          item: items,
          status: invoiceStatus,
          created_at: new Date(),
          user_id: user?.id,
          amount: totalAmount,
        },
      ]);

    setIsSubmitting(false);

    if (error) {
      console.error("Error inserting invoice:", error);
    } else {
      console.log("Invoice submitted:", data);
      router.push("/(tabs)/invoice");
    }
  };

  const totalAmount = items.reduce(
    (total, item) => total + parseFloat(item.price) * parseInt(item.quantity),
    0
  );

  return (
    <View style={styles.container}>
      <View style={{ paddingVertical: width * 0.05, flexDirection: 'row' }}>
        <Octicons 
          name="arrow-left" 
          size={width * 0.05} 
          color="black" 
          onPress={() => router.back()}
        />
        <Text
          style={{
            fontSize: width * 0.05,
            fontWeight: "semibold",
            marginBottom: width * 0.05,
            marginLeft: width * 0.02
          }}
        >
          Create New Invoice
        </Text>
      </View>
      <ScrollView>
        <TextInput
          style={styles.input}
          placeholder="Nama Kustomer"
          value={customerName}
          onChangeText={setCustomerName}
        />

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Alamat"
          value={customerAddress}
          onChangeText={setCustomerAddress}
          multiline
        />

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text style={styles.sectionTitle}>Invoice Items</Text>
          <Octicons
            name="plus"
            size={width * 0.05}
            color="black"
            onPress={() => setModalVisible(true)}
          />
        </View>

        <Modal
          isVisible={modalVisible}
          onBackdropPress={() => {
            setItemNameTemp("");
            setItemPriceTemp(0);
            setItemQuantityTemp(1);
            setModalVisible(false);
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              padding: width * 0.05,
              borderRadius: width * 0.02,
            }}
          >
            <TextInput
              style={styles.input}
              placeholder="Detail"
              onChangeText={setItemNameTemp}
              value={itemNameTemp}
            />
            <TextInput
              style={styles.input}
              placeholder="Harga"
              keyboardType="numeric"
              onChangeText={(text) => setItemPriceTemp(Number(text))}
            />
            <TextInput
              style={styles.input}
              placeholder="Quantity"
              keyboardType="numeric"
              onChangeText={(text) => setItemQuantityTemp(Number(text))}
            />
            <Button title="Add Item" onPress={handleAddItem} />
          </View>
        </Modal>

        <View>
          {items.map((item, index) => (
            <View
              key={index}
              style={{
                width: "100%",
                borderRadius: 10,
                padding: width * 0.05,
                flexDirection: "row",
                marginBottom: width * 0.04,
                backgroundColor: "#f9f9f9",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: "10%",
                }}
              >
                <Octicons name="package" size={width * 0.05} color="black" />
              </View>
              <View style={{ width: "50%" }}>
                <Text
                  style={{ fontWeight: "bold", marginBottom: width * 0.02 }}
                >
                  {item.name}
                </Text>
                <Text style={{ color: "grey" }}>Qty: {item.quantity}</Text>
              </View>

              <View style={{ width: "30%", alignItems: "flex-end" }}>
                <Text
                  style={{ fontWeight: "bold", marginBottom: width * 0.02 }}
                >
                  {formatCurrency(parseInt(item.price))}
                </Text>
              </View>
              <View style={{ width: "10%", alignItems: "flex-end" }}>
                <Octicons 
                  name="trash"
                  size={width * 0.05} 
                  color="red" 
                  onPress={() => handleRemoveItem(index)}
                />
              </View>
            </View>
          ))}
        </View>

        <View style={{ marginBottom: width * 0.02 }}>
          <Picker
            selectedValue={invoiceStatus}
            onValueChange={(itemValue: any) => setInvoiceStatus(itemValue)}
          >
            <Picker.Item label="Unpaid" value="unpaid" />
            <Picker.Item label="Paid" value="paid" />
            <Picker.Item label="On Progress" value="onprogress" />
            <Picker.Item label="Cancel" value="canceled" />
          </Picker>
        </View>
      </ScrollView>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginVertical: width * 0.1,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: "bold" }}>
          {formatCurrency(totalAmount)}
        </Text>
        <View
          style={{
            backgroundColor: "black",
            borderRadius: width * 0.02,
            padding: width * 0.01,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Button title="Submit Invoice" color="white" onPress={handleSubmit} />
          )}
        </View>
      </View>
    </View>
  );
};

export default CreateInvoiceScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingTop: width * 0.1,
    paddingHorizontal: width * 0.05,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: width * 0.02,
    padding: 10,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "semibold",
    marginVertical: 10,
  },
});
