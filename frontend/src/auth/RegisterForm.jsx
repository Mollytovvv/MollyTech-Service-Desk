import { useState } from "react";
import api from "../api/axios";
import ApprovalModal from "./ApprovalModal";

import {
    FiUser,
    FiMail,
    FiPhone,
    FiLock,
    FiEye,
    FiEyeOff,
    FiArrowLeft
} from "react-icons/fi";

import { useToast } from "../context/ToastContext";

import "./RegisterForm.css";


export default function RegisterForm({setMode}){

    // =========================
    // FORM STATE
    // =========================

    const [firstName,setFirstName] = useState("");

    const [lastName,setLastName] = useState("");

    const [email,setEmail] = useState("");

    const [phone,setPhone] = useState("");

    const [password,setPassword] = useState("");

    const [confirmPassword,setConfirmPassword] = useState("");


    // =========================
    // UI STATE
    // =========================

    const [loading,setLoading] = useState(false);

    const [showPassword,setShowPassword] = useState(false);

    const [showConfirmPassword,setShowConfirmPassword] = useState(false);

    const [showApproval,setShowApproval] = useState(false);

    const { showToast } = useToast();

    // =========================
    // REGISTER
    // =========================

    const handleRegister = async(e)=>{

        e.preventDefault();

        setLoading(true);


        try{


            if(password !== confirmPassword){

                return showToast(
                    "warning",
                    "Passwords do not match."
                );

            }

            

            await api.post(
                "/auth/register",
                {

                    firstName,

                    lastName,

                    email,

                    phone:`+63${phone.replace(/\s/g,"")}`,

                    password

                }
            );

            setShowApproval(true);
        }

        catch(err){


            showToast(

                "error",

                err.response?.data?.message ||

                "Registration failed."

            );


        }

        finally{

            setLoading(false);

        }

    };



    return (

        <div className="register-page">

            {/* =========================
                REGISTER PANEL
            ========================= */}



            <section className="register-panel">


                <div className="register-card">



                <div className="register-header">

                    <button
                        type="button"
                        className="back-login-btn"
                        onClick={() => setMode("login")}
                    >

                        <FiArrowLeft />

                        Back to Login

                    </button>


                    <h3>
                        Create Account
                    </h3>


                    <p>
                        Submit your information for MollyTech access.
                    </p>

                </div>




                    <form

                        className="register-form"

                        onSubmit={handleRegister}

                    >




                        {/* NAME ROW */}


                        <div className="register-row">


                            <div className="register-field">


                                <label>

                                    First Name

                                </label>


                                <div className="register-input">


                                    <FiUser />


                                    <input

                                        type="text"

                                        placeholder="First name"

                                        value={firstName}

                                        onChange={(e)=>
                                            setFirstName(e.target.value)
                                        }

                                        required

                                    />


                                </div>


                            </div>




                            <div className="register-field">


                                <label>

                                    Last Name

                                </label>


                                <div className="register-input">


                                    <FiUser />


                                    <input

                                        type="text"

                                        placeholder="Last name"

                                        value={lastName}

                                        onChange={(e)=>
                                            setLastName(e.target.value)
                                        }

                                        required

                                    />


                                </div>


                            </div>


                        </div>





                        {/* EMAIL */}


                        <div className="register-field">


                            <label>

                                Email Address

                            </label>


                            <div className="register-input">


                                <FiMail />


                                <input

                                    type="email"

                                    placeholder="Enter your email"

                                    value={email}

                                    onChange={(e)=>
                                        setEmail(e.target.value)
                                    }

                                    required

                                />


                            </div>


                        </div>





                        {/* PHONE */}


                        <div className="register-field">


                            <label>

                                Phone Number

                            </label>


                            <div className="register-input">

                                <FiPhone />


                                <span className="phone-prefix">
                                    +63
                                </span>


                                <input

                                    type="tel"

                                    placeholder="912 345 6789"

                                    value={phone}

                                    maxLength="12"

                                    onChange={(e)=>{


                                        let value = e.target.value;


                                        // remove spaces
                                        value = value.replace(/\s/g,"");


                                        // numbers only
                                        if(/^\d*$/.test(value)){


                                            // format 912 345 6789

                                            if(value.length > 6){


                                                value =
                                                value.slice(0,3)
                                                + " "
                                                + value.slice(3,6)
                                                + " "
                                                + value.slice(6,10);


                                            }

                                            else if(value.length > 3){


                                                value =
                                                value.slice(0,3)
                                                + " "
                                                + value.slice(3);


                                            }


                                            setPhone(value);


                                        }


                                    }}

                                    required

                                />


                            </div>


                        </div>





                        {/* PASSWORD */}


                        <div className="register-field">


                            <label>

                                Password

                            </label>


                            <div className="register-input">


                                <FiLock />


                                <input

                                    type={
                                        showPassword
                                        ?
                                        "text"
                                        :
                                        "password"
                                    }

                                    placeholder="Create password"

                                    value={password}

                                    onChange={(e)=>
                                        setPassword(e.target.value)
                                    }

                                    required

                                />


                                <button

                                    type="button"

                                    className="password-toggle"

                                    onClick={()=>
                                        setShowPassword(!showPassword)
                                    }

                                >

                                    {

                                    showPassword

                                    ?

                                    <FiEyeOff />

                                    :

                                    <FiEye />

                                    }


                                </button>


                            </div>


                        </div>






                        {/* CONFIRM PASSWORD */}


                        <div className="register-field">


                            <label>

                                Confirm Password

                            </label>


                            <div className="register-input">


                                <FiLock />


                                <input

                                    type={
                                        showConfirmPassword
                                        ?
                                        "text"
                                        :
                                        "password"
                                    }

                                    placeholder="Confirm password"

                                    value={confirmPassword}

                                    onChange={(e)=>
                                        setConfirmPassword(e.target.value)
                                    }

                                    required

                                />


                                <button

                                    type="button"

                                    className="password-toggle"

                                    onClick={()=>
                                        setShowConfirmPassword(!showConfirmPassword)
                                    }

                                >

                                    {

                                    showConfirmPassword

                                    ?

                                    <FiEyeOff />

                                    :

                                    <FiEye />

                                    }


                                </button>


                            </div>


                        </div>





                        <button

                            className="register-btn"

                            type="submit"

                            disabled={loading}

                        >

                            {

                            loading

                            ?

                            "Submitting..."

                            :

                            "Create Account"

                            }


                        </button>




                    </form>




                    <div className="login-link">


                        <span>

                            Already have an account?

                        </span>


                        <button

                            type="button"

                            onClick={() => setMode("login")}

                        >

                            Sign In

                        </button>


                    </div>




                </div>


            </section>

            {
                showApproval && (

                    <ApprovalModal

                        onClose={()=>{

                            setShowApproval(false);

                            setMode("login");

                        }}

                    />

                )
            }

        </div>

    );

}