import {useState, useEffect} from "react";
import FAQListing from "./FAQListing";
import FAQData from "../faqs.json";

const FAQListings = () => {
    const [FAQs, setFAQs] = useState([]);
    const [loading, setLoading] = useState(true);

    // useEffect(() => {
    //     const fetchFAQs = async () => {
    //         const apiUrl = 'https://api.randomuser.me/?nat=US&results=100'
    //         try{
    //             const res = await fetch(apiUrl);
    //             const data = await res.json();
    //             console.log("불러와진 데이터(data.results):",data.results);
    //             setFAQs(data.results);
    //         } catch(error){
    //             console.log('Error fetching data', error);
    //         } finally{
    //             setLoading(false);
    //         }      
    //     }
    //     fetchFAQs();
    // }, []);
    return (
        <div className="faq-listings">
            {/* {loading ?  (<div>로딩 중...</div>) : (
                <ul>
                    {FAQs?.map((FAQ) => (
                        <FAQListing key={FAQ.id.value} faq={FAQ} />
                        
                    ))}
                </ul>
            )} */}
            <ul>
                {FAQData.faqs.map((FAQ) => (
                    <FAQListing key={FAQ.id} faq={FAQ} />
                 ))}
            </ul>
        </div>
    );
}
export default FAQListings;