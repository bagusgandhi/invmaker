import { useEffect, useState } from "react";
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
import { useRouter, useLocalSearchParams } from "expo-router";
import { Octicons } from "@expo/vector-icons";
import { supabase } from "@/utils/supabase";
import { formatCurrency } from "@/utils/currency";

const { width } = Dimensions.get("window");

const EditInvoiceScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // Get the dynamic id from the route
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [invoice, setInvoice] = useState<any>(null);
  const [customerName, setCustomerName] = useState<string>("");
  const [customerAddress, setCustomerAddress] = useState<string>("");
  const [items, setItems] = useState<
    { name: string; price: string; quantity: string }[]
  >([]);
  const [invoiceStatus, setInvoiceStatus] = useState<string>("unpaid");
  const [itemNameTemp, setItemNameTemp] = useState<string>("");
  const [itemPriceTemp, setItemPriceTemp] = useState<number>(0);
  const [itemQuantityTemp, setItemQuantityTemp] = useState<number>(1);
  const [modalVisible, setModalVisible] = useState(false);

  // Fetch invoice details on mount
  useEffect(() => {
    const fetchInvoice = async () => {
      const { data, error } = await supabase
        .from("invoice")
        .select("*")
        .eq("id", id)
        .single();

      console.log(data);

      if (error) {
        console.error("Error fetching invoice:", error);
        router.back();
      } else {
        setInvoice(data);
        setCustomerName(data.customer_name);
        setCustomerAddress(data.address);
        setItems(data.item || []);
        setInvoiceStatus(data.status);
      }
      setIsLoading(false);
    };

    fetchInvoice();
  }, [id]);

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

  const handleUpdate = async () => {
    setIsSubmitting(true);

    const totalAmount = items.reduce(
      (total, item) => total + parseFloat(item.price) * parseInt(item.quantity),
      0
    );

    const { error } = await supabase
      .from("invoice")
      .update({
        customer_name: customerName,
        address: customerAddress,
        item: items,
        status: invoiceStatus,
        amount: totalAmount,
      })
      .eq("id", id);

    setIsSubmitting(false);

    if (error) {
      console.error("Error updating invoice:", error);
    } else {
      router.push("/(tabs)/invoice");
    }
  };

  if (isLoading) {
    return (
      <View style={{ 
        backgroundColor: '#fff', 
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%'
      }} >
        <ActivityIndicator size="large" color="black" />
      </View>
    );
  }

  const totalAmount = items.reduce(
    (total, item) => total + parseFloat(item.price) * parseInt(item.quantity),
    0
  );

  return (
    <View style={styles.container}>
      <View style={{ paddingVertical: width * 0.05, flexDirection: "row" }}>
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
            marginLeft: width * 0.02,
          }}
        >
          Update Invoice
        </Text>
      </View>
      <ScrollView>
        <Text style={{
          marginBottom: width * 0.06,
          fontSize: width * 0.05,
          fontWeight: 'bold',
          color: 'grey'
        }}>#{invoice.invoice}</Text>
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
            <Button
              color="white"
              title="Update Invoice"
              onPress={handleUpdate}
            />
          )}
        </View>
      </View>
    </View>
  );
};

export default EditInvoiceScreen;

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
