import { useEffect, useState } from "react";

import api from "../../api/axios";

import { useAuth } from "../../context/AuthContext";

import {
    FiUser,
    FiMail,
    FiPhone,
    FiCalendar,
    FiCheck,
    FiX
} from "react-icons/fi";

import { FiAlertTriangle } from "react-icons/fi";

import { useToast } from "../../context/ToastContext";

import "../styles/AccessRequests.css";


export default function AccessRequests(){

    const [requests,setRequests] = useState([]);

    const [loading,setLoading] = useState(true);

    const [approveRequest,setApproveRequest] = useState(null);

    const [declineRequest,setDeclineRequest] = useState(null);

    const { showToast } = useToast();

    const { token } = useAuth();



    // =========================
    // FETCH REQUESTS
    // =========================

    const fetchRequests = async()=>{

        try{

            const res = await api.get(
                "/approvals/pending",
                {
                    headers:{
                        Authorization:`Bearer ${token}`
                    }
                }
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
                `/approvals/${id}/approve`,
                {},
                {
                    headers:{
                        Authorization:`Bearer ${token}`
                    }
                }
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


            if(!reason){
                return;
            }

        try{

            await api.patch(
                `/approvals/${id}/decline`,
                {
                    reason
                },
                {
                    headers:{
                        Authorization:`Bearer ${token}`
                    }
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

                                        <div>

                                            <span>
                                                {
                                                    user.createdAt
                                                    ?
                                                    new Date(user.createdAt)
                                                    .toLocaleDateString([],{
                                                        month:"short",
                                                        day:"numeric",
                                                        year:"numeric"
                                                    })
                                                    :
                                                    "Unknown"
                                                }
                                            </span>


                                            <small>
                                                {
                                                    user.createdAt
                                                    &&
                                                    new Date(user.createdAt)
                                                    .toLocaleTimeString([],{
                                                        hour:"2-digit",
                                                        minute:"2-digit"
                                                    })
                                                }
                                            </small>

                                        </div>

                                    </div>

                                    <div className="action-buttons">


                                        <button

                                            className="approve-btn"

                                            onClick={()=>
                                                setApproveRequest(user)
                                            }

                                        >

                                            <FiCheck/>

                                            Approve

                                        </button>





                                        <button

                                            className="decline-btn"

                                            onClick={()=>
                                                setDeclineRequest(user)
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

            {approveRequest && (

            <div
                className="modal-overlay"
                onClick={() => setApproveRequest(null)}
            >

                <div
                    className="modal resolve-modal"
                    onClick={(e)=>e.stopPropagation()}
                >


                    <div className="resolve-header">

                        <FiAlertTriangle className="resolve-icon"/>

                        <h2>
                            Approve Account
                        </h2>

                    </div>



                    <div className="resolve-body">

                        <p>
                            Are you sure you want to approve this account?
                        </p>


                        <div className="resolve-warning">

                            {approveRequest.firstName}{" "}
                            {approveRequest.lastName}
                            {" "}will be able to access MollyTech Service Desk.

                        </div>


                    </div>




                    <div className="resolve-actions">


                        <button
                            className="btn-cancel"
                            onClick={() =>
                                setApproveRequest(null)
                            }
                        >

                            Cancel

                        </button>



                        <button
                            className="btn-confirm-resolve"
                            onClick={()=>{
                                
                                handleApprove(
                                    approveRequest._id
                                );

                                setApproveRequest(null);

                            }}
                        >

                            Approve Account

                        </button>


                    </div>



                </div>

            </div>

            )}

        </div>

    );

}