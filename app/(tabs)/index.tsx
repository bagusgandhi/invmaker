import {
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
  ScrollView,
  Button,
  TouchableOpacity,
} from "react-native";
import { useClerk } from "@clerk/clerk-expo";
import { MaterialIcons, Octicons } from "@expo/vector-icons";
import { supabase } from "@/utils/supabase";
import { useEffect, useState } from "react";
import { formatCurrency } from '@/utils/currency';
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");
const HomeScreen = () => {
  const { signOut, user } = useClerk();
  const [ unpaidCount, setUnpaidCount ] = useState(0);
  const [ revenue, setRevenue ] = useState(0);
  const router = useRouter();


  const countUnpaidInvoice = async () => {
    try {
      const { data: invoice, error, count } = await supabase.
      from('invoice')
      .select('id', { count: 'exact' }) 
      .eq('user_id', user?.id)
      .eq('status', 'unpaid')

      if(error){
        throw new Error(error.message);
      }

      setUnpaidCount(count ?? 0)

      return count;
    } catch (error) {
      console.error('Error fetching data:', error);
      return [];
    }
  };

  const sumRevenue = async () => {
    try {
      const { data, error } = await supabase.rpc('get_current_month_paid_revenue');

      if(error){
        throw new Error(error.message);
      }

      setRevenue(data ?? 0)

      return data;
    } catch (error) {
      console.error('Error fetching data:', error);
      return [];
    }
  };

  useEffect(() => {
    countUnpaidInvoice();
    sumRevenue();
  }, []);

  // console.log(user);
  return (
    <ScrollView style={{ backgroundColor: "white", paddingHorizontal: width * 0.05 }}>
      <View style={styles.container}>
        <View style={{
          flexDirection: 'row',
          width: '100%',
          justifyContent: 'flex-end',
          marginBottom: width * 0.04
        }}>
          <TouchableOpacity 
              onPress={() => signOut()}
          >
            <Octicons 
              name="sign-out" 
              size={width * 0.04} 
              color="black" 
            />
          </TouchableOpacity>
        </View>
        <View style={{ alignItems: "center" }}>
          <Image style={styles.imgProfile} source={{ uri: user?.imageUrl }} />
          <Text style={styles.title}>Hai, {user?.firstName}</Text>
        </View>

        {/* summary information  */}
        <View
          style={{
            marginTop: width * 0.1,
            // marginHorizontal: width * 0.05,
          }}
        >
          <Text
            style={{
              color: "black",
              fontSize: width * 0.05,
              fontWeight: "semibold",
              marginBottom: width * 0.02,
            }}
          >
            Overview
          </Text>
          <View style={{ flex: 1, flexDirection: "row", justifyContent: "space-between" }}>
            {/* card unpaid information */}
            <View
              style={{
                backgroundColor: "#58fe0a",
                borderRadius: width * 0.05,
                flexDirection: "column",
                width: '37%',
                padding: width * 0.05,
                margin: width * 0.01
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: width * 0.05,
                }}
              >
                <View
                  style={{
                    backgroundColor: "black",
                    borderRadius: width * 0.05,
                    padding: width * 0.02,
                    marginRight: width * 0.02,
                  }}
                >
                  <Octicons name="file" size={width * 0.03} color="white" />
                </View>
                <Text style={{ color: "black" }}>Invoices</Text>
              </View>

              <View style={{ marginBottom: width * 0.05 }}>
                <Text style={{ color: "black", fontSize: width * 0.1 }}>
                  {unpaidCount}
                </Text>
                <Text style={{ color: "black", fontSize: width * 0.05 }}>
                  Unpaid
                </Text>
              </View>

              <View>
                <View
                  style={{
                    backgroundColor: "black",
                    borderRadius: width * 0.02,
                    padding: width * 0.01,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Button
                    color="white"
                    title="View All"
                    onPress={() => router.push('/(tabs)/invoice')}
                  />
                </View>
              </View>
            </View>

            {/* card revenue information */}
            <View
              style={{
                backgroundColor: "#f9f9f9",
                borderRadius: width * 0.05,
                flexDirection: "column",
                width: '60%',
                // justifyContent: "space-between",
                padding: width * 0.05,
                margin: width * 0.01

              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: width * 0.05,
                }}
              >
                <View
                  style={{
                    backgroundColor: "white",
                    borderRadius: width * 0.05,
                    padding: width * 0.01,
                    marginRight: width * 0.02,
                    borderColor: "black",
                    borderWidth: StyleSheet.hairlineWidth
                  }}
                >
                   <MaterialIcons name="attach-money" size={width * 0.05} color="black" />
                </View>
                <Text style={{ color: "black" }}>Revenue in Month</Text>
              </View>

              <View style={{ marginBottom: width * 0.05 }}>
                <Text style={{ color: "black", fontSize: width * 0.05 }}>
                  {formatCurrency(revenue)}
                </Text>
              </View>

            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: "center",
    // alignItems: "center",
    marginTop: width * 0.2,
  },
  title: {
    fontSize: width * 0.07,
    fontWeight: "semibold",
  },
  imgProfile: {
    width: width * 0.15,
    height: width * 0.15,
    borderRadius: 50,
    marginBottom: width * 0.08,
  },
});


