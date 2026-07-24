export function formatPhone(phone){

    if(!phone){
        return "";
    }


    const cleaned = phone.replace(/\D/g,"");


    if(cleaned.startsWith("09")){

        return (
            "+63 " +
            cleaned.substring(1,4) +
            " " +
            cleaned.substring(4,7) +
            " " +
            cleaned.substring(7,11)
        );

    }


    return phone;

}