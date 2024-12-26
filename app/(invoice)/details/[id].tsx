import { useEffect, useState } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Button,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Octicons } from "@expo/vector-icons";
import { supabase } from "@/utils/supabase";
import { formatCurrency } from "@/utils/currency";
import { printToFileAsync } from "expo-print";
import { shareAsync } from "expo-sharing";
import { htmlPdfInvoice } from "@/utils/htmlpdf";
import * as FileSystem from "expo-file-system";

const { width } = Dimensions.get("window");

const DetailInvoiceScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // Get the dynamic id from the route
  const [isLoading, setIsLoading] = useState(true);
  const [invoice, setInvoice] = useState<any>(null);
  const [customerName, setCustomerName] = useState<string>("");
  const [customerAddress, setCustomerAddress] = useState<string>("");
  const [items, setItems] = useState<
    { name: string; price: string; quantity: string }[]
  >([]);
  const [invoiceStatus, setInvoiceStatus] = useState<string>("unpaid");

  const mapColorStatus: any = {
    paid: "green",
    unpaid: "red",
    onprogress: "blue",
    canceled: "gray",
  };

  const mapColorTextStatus: any = {
    paid: "white",
    unpaid: "white",
    onprogress: "black",
    canceled: "white",
  };

  // Fetch invoice details on mount
  useEffect(() => {
    const fetchInvoice = async () => {
      const { data, error } = await supabase
        .from("invoice")
        .select("*")
        .eq("id", id)
        .single();

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

  const handleUpdate = async () => {
    router.push(`/(invoice)/edit/${id}`);
  };

  const generatePdf = async () => {
    try {
      const file = await printToFileAsync({
        html: htmlPdfInvoice({
          customerName,
          customerAddress,
          invoice,
          items,
          totalAmount,
        }),
        base64: false,
      });

      if (file && file.uri) {
        // New file name
        const newFileName = `${FileSystem.documentDirectory}${invoice.invoice}.pdf`;

        // Rename the PDF file
        await FileSystem.moveAsync({
          from: file.uri,
          to: newFileName,
        });

        // Share the renamed PDF
        await shareAsync(newFileName, {
          mimeType: "application/pdf",
          dialogTitle: "Share Invoice PDF",
        });
      } else {
        alert("Error generating PDF");
      }
    } catch (error) {
      console.log(error);
      alert("Error generating PDF");
    }

    // await shareAsync(file.uri)
  };

  if (isLoading) {
    return (
      <View
        style={{
          backgroundColor: "#fff",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
        }}
      >
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
          Detail Invoice
        </Text>
      </View>
      <ScrollView>
        <View
          style={{
            backgroundColor: mapColorStatus[invoice.status],
            borderRadius: width * 0.03,
            padding: width * 0.05,
            marginBottom: width * 0.01,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text
              style={{
                marginBottom: width * 0.06,
                fontSize: width * 0.04,
                fontWeight: "bold",
                color: mapColorTextStatus[invoice.status],
              }}
            >
              #{invoice.invoice}
            </Text>
            <Text
              style={{
                paddingVertical: width * 0.015,
                paddingHorizontal: width * 0.03,
                borderRadius: width * 0.02,
                marginBottom: width * 0.06,
                fontSize: width * 0.04,
                fontWeight: "bold",
                color: "white",
              }}
            >
              {invoice.status ?? "-"}
            </Text>
          </View>
          <Text
            style={{
              marginBottom: width * 0.06,
              fontSize: width * 0.04,
              fontWeight: "semibold",
              color: mapColorTextStatus[invoice.status],
            }}
          >
            {customerName ?? "-"}
          </Text>
          <Text
            style={{
              marginBottom: width * 0.06,
              fontSize: width * 0.04,
              fontWeight: "semibold",
              color: mapColorTextStatus[invoice.status],
            }}
          >
            {customerAddress ?? "-"}
          </Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text style={styles.sectionTitle}>Invoice Items</Text>
        </View>

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
              <View style={{ width: "60%" }}>
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
            </View>
          ))}
        </View>
      </ScrollView>
      <View
        style={{
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          marginVertical: width * 0.1,
          gap: width * 0.03,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <Text style={{ fontSize: width * 0.05, fontWeight: "bold" }}>
            Total:
          </Text>
          <Text style={{ fontSize: width * 0.05, fontWeight: "bold" }}>
            {formatCurrency(totalAmount)}
          </Text>
        </View>
        <View
          style={{
            width: "100%",
            backgroundColor: "#f9f9f9",
            borderRadius: width * 0.02,
            borderWidth: StyleSheet.hairlineWidth,
            padding: width * 0.01,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Button
            color="black"
            title="Download Invoice"
            onPress={generatePdf}
          />
        </View>
        <View
          style={{
            width: "100%",
            backgroundColor: "black",
            borderRadius: width * 0.02,
            padding: width * 0.01,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Button color="white" title="Edit Invoice" onPress={handleUpdate} />
        </View>
      </View>
    </View>
  );
};

export default DetailInvoiceScreen;

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
