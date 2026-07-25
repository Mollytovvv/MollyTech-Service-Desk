import { useEffect, useState } from "react";

import api from "../../api/axios";

import {
    FiUser,
    FiMail,
    FiPhone,
    FiCalendar,
    FiCheck,
    FiX
} from "react-icons/fi";

import { useToast } from "../../context/ToastContext";

import "../styles/AccessRequests.css";


export default function AccessRequests(){

    const [requests,setRequests] = useState([]);

    const [loading,setLoading] = useState(true);

    const { showToast } = useToast();



    // =========================
    // FETCH REQUESTS
    // =========================

    const fetchRequests = async()=>{

        try{

            const res = await api.get(
                "/approvals/pending"
            );


            setRequests(
                res.data.users || []
            );


        }
        catch(err){

            showToast(
                "error",
                "Failed to load access requests."
            );

        }
        finally{

            setLoading(false);

        }

    };



    useEffect(()=>{

        fetchRequests();

    },[]);




    // =========================
    // APPROVE USER
    // =========================

    const handleApprove = async(id)=>{

        try{

            await api.patch(
                `/approvals/${id}/approve`
            );


            showToast(
                "success",
                "Account approved successfully."
            );


            fetchRequests();


        }
        catch(err){

            showToast(
                "error",
                "Failed to approve account."
            );

        }

    };




    // =========================
    // DECLINE USER
    // =========================

    const handleDecline = async(id)=>{

        const reason = prompt(
            "Enter decline reason:"
        );


        try{

            await api.patch(
                `/approvals/${id}/decline`,
                {
                    reason
                }
            );


            showToast(
                "success",
                "Account declined."
            );


            fetchRequests();


        }
        catch(err){

            showToast(
                "error",
                "Failed to decline account."
            );

        }

    };





    return (

        <div className="access-page">


            {/* HEADER */}

            <div className="access-header">

                <div>

                    <h1>
                        Access Requests
                    </h1>


                    <p>
                        Review and manage pending account registrations.
                    </p>

                </div>


                <div className="request-count">

                    {requests.length} Pending

                </div>

            </div>





            {/* CONTENT */}


            <div className="access-card">



                {
                    loading ?

                    (

                        <div className="access-empty">

                            Loading requests...

                        </div>

                    )

                    :

                    requests.length === 0 ?

                    (

                        <div className="access-empty">

                            No pending access requests.

                        </div>

                    )

                    :

                    (

                    <div className="request-table">


                        <div className="table-header">

                            <span>
                                User
                            </span>

                            <span>
                                Contact
                            </span>

                            <span>
                                Requested
                            </span>

                            <span>
                                Actions
                            </span>

                        </div>





                        {
                            requests.map((user)=>(


                                <div
                                    className="request-row"
                                    key={user._id}
                                >


                                    <div className="user-info">


                                        <FiUser/>


                                        <div>

                                            <strong>
                                                {user.firstName} {user.lastName}
                                            </strong>


                                            <small>
                                                Pending Registration
                                            </small>

                                        </div>


                                    </div>





                                    <div className="contact-info">


                                        <span>

                                            <FiMail/>

                                            {user.email}

                                        </span>


                                        <span>

                                            <FiPhone/>

                                            {user.phone}

                                        </span>


                                    </div>





                                    <div className="date-info">

                                        <FiCalendar/>

                                        {
                                            new Date(
                                                user.createdAt
                                            )
                                            .toLocaleDateString()
                                        }

                                    </div>





                                    <div className="action-buttons">


                                        <button

                                            className="approve-btn"

                                            onClick={()=>
                                                handleApprove(user._id)
                                            }

                                        >

                                            <FiCheck/>

                                            Approve

                                        </button>





                                        <button

                                            className="decline-btn"

                                            onClick={()=>
                                                handleDecline(user._id)
                                            }

                                        >

                                            <FiX/>

                                            Decline

                                        </button>


                                    </div>


                                </div>


                            ))

                        }



                    </div>

                    )

                }



            </div>


        </div>

    );

}