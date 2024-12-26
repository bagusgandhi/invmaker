import { SignedIn, useClerk } from "@clerk/clerk-expo";
import { FlatList, Dimensions, StyleSheet, Text, View, TextInput, Button, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
const { width, height } = Dimensions.get("window");
import { supabase } from '../../utils/supabase';
import { useEffect, useState } from "react";
import { MaterialIcons, Octicons } from "@expo/vector-icons";
import { formatCurrency } from "@/utils/currency";
import moment from "moment";
import { useRouter } from "expo-router";

const InvoiceScreen = () => {
  const { signOut, user } = useClerk();
  const router = useRouter();
  const [invoices, setInvoices] = useState<{
    id: any;
    customer_name: any;
    status: any;
    amount: any;
    updated_at: any;
  }[]>([]);
  const [loading, setLoading] = useState(true); // Add loading state

  const fetchData = async () => {
    setLoading(true); // Set loading to true when fetch starts
    try {
      const { data: invoice, error } = await supabase
        .from('invoice')
        .select('id, customer_name, status, amount, updated_at')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      setInvoices(invoice);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false); // Set loading to false after fetch completes
    }
  };

  const mapColorStatus: any = {
    'paid': 'green',
    'unpaid': 'red',
    'onprogress': 'blue',
    'canceled': 'gray'
  };

  useEffect(() => {
    fetchData();
  }, []);

  const Card = ({ id, customer_name, updated_at, amount, status }: { id: string, customer_name: string; updated_at: string; amount: string; status: string; }) => (
    <TouchableOpacity
      onPress={() => router.push(`/(invoice)/details/${id}`)}
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
      <View style={{ width: "10%" }}>
        <Octicons name="file" size={width * 0.05} color="black" />
      </View>
      <View style={{ width: "60%" }}>
        <Text style={{ fontWeight: "bold", marginBottom: width * 0.02 }}>
          {customer_name}
        </Text>
        <Text style={{ color: "grey" }}>{moment(updated_at).format('DD/MM/YYYY HH:mm')}</Text>
      </View>

      <View style={{ width: "30%", alignItems: "flex-end" }}>
        <Text style={{ fontWeight: "bold", marginBottom: width * 0.02 }}>
          {formatCurrency(parseInt(amount) ?? 0)}
        </Text>
        <Text style={{ fontWeight: "bold", color: mapColorStatus[status] }}>{status}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderItem = ({ item }: any) => (
    <Card id={item.id} customer_name={item.customer_name} updated_at={item.updated_at} amount={item.amount} status={item.status} />
  );

  return (
    <View style={styles.container}>
      <View style={{ paddingVertical: width * 0.05 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={{
            fontSize: width * 0.05,
            fontWeight: "semibold",
            marginBottom: width * 0.05
          }}>List Invoice</Text>
          <MaterialIcons name="tune" size={width * 0.05} color="black" />
        </View>
        <TextInput
          style={{ borderRadius: width * 0.1, backgroundColor: "#eee", padding: width * 0.02 }}
          onChangeText={() => { }}
          placeholder="Search"
        />
      </View>

      {loading ? ( // Show loading indicator while data is being fetched
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="black" />
        </View>
      ) : (
        <FlatList
          data={invoices}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: width * 0.2 }}
        />
      )}
    </View>
  );
};

export default InvoiceScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingTop: width * 0.1,
    paddingHorizontal: width * 0.05,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
