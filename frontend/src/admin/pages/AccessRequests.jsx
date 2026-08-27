import { useEffect, useState } from "react";

import api from "../../api/axios";

import { useAuth } from "../../context/AuthContext";
import socket, { connectSocket } from "../../socket/socket";

import {
    FiUser,
    FiMail,
    FiPhone,
    FiCalendar,
    FiCheck,
    FiX,
    FiAlertTriangle
} from "react-icons/fi";

import { useToast } from "../../context/ToastContext";

import "../styles/AccessRequests.css";


export default function AccessRequests(){

    const [requests,setRequests] = useState([]);

    const [loading,setLoading] = useState(true);

    const [approveRequest,setApproveRequest] = useState(null);

    const [declineRequest,setDeclineRequest] = useState(null);

    const [declineReason,setDeclineReason] = useState("");

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

            console.log(
                "FETCH REQUEST ERROR:",
                err
            );


            showToast(
                "error",
                "Failed to load access requests."
            );

        }
        finally{

            setLoading(false);

        }

    };



    // =========================
    // REALTIME ACCESS REQUESTS
    // =========================
    useEffect(()=>{


        fetchRequests();



        const handleNewRequest = (data)=>{

            console.log(
                "NEW ACCESS REQUEST RECEIVED:",
                data
            );


            fetchRequests();

        };



        socket.on(
            "newAccessRequest",
            handleNewRequest
        );



        return()=>{


            socket.off(
                "newAccessRequest",
                handleNewRequest
            );


        };


    },[]);

    // =========================
    // APPROVE USER
    // =========================
    const handleApprove = async (id) => {

        try {

            const res = await api.patch(
                `/approvals/${id}/approve`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (res.data.emailSent) {

                showToast(
                    "success",
                    "Account approved successfully. Approval email sent."
                );

            } else {

                showToast(
                    "warning",
                    "Account approved, but the approval email could not be sent."
                );

            }

            fetchRequests();

        }
        catch (err) {

            console.log(
                "APPROVE ERROR:",
                err.response?.data || err
            );

            showToast(
                "error",
                err.response?.data?.message ||
                "Failed to approve account."
            );

        }

    };





    // =========================
    // DECLINE USER
    // =========================
    const handleDecline = async(id)=>{

        try{

            await api.patch(
                `/approvals/${id}/decline`,
                {
                    reason:
                    declineReason.trim() ||
                    "No reason provided"
                },
                {
                    headers:{
                        Authorization:`Bearer ${token}`
                    }
                }
            );


            showToast(
                "success",
                "Account declined successfully."
            );


            setDeclineReason("");

            fetchRequests();


        }
        catch(err){

            console.log(
                "DECLINE ERROR:",
                err.response?.data || err
            );


            showToast(
                "error",
                err.response?.data?.message ||
                "Failed to decline account."
            );

        }

    };

    return (

        <div className="access-page">


            {/* HEADER */}

            <div className="access-header">

                <div>

                </div>


                <div className="request-count">

                    {requests.length} Pending

                </div>

            </div>





            {/* TABLE */}

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

                        <span>User</span>

                        <span>Contact</span>

                        <span>Requested</span>

                        <span>Actions</span>

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

                                        onClick={()=>{

                                            setDeclineRequest(user);

                                            setDeclineReason("");

                                        }}

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





            {/* =========================
                APPROVE MODAL
            ========================= */}


            {approveRequest && (

                <div
                    className="modal-overlay"
                    onClick={()=>setApproveRequest(null)}
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

                                onClick={()=>
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







            {/* =========================
                DECLINE MODAL
            ========================= */}



            {declineRequest && (

                <div
                    className="modal-overlay"
                    onClick={()=>setDeclineRequest(null)}
                >


                    <div
                        className="modal resolve-modal"
                        onClick={(e)=>e.stopPropagation()}
                    >


                        <div className="resolve-header">

                            <FiAlertTriangle className="resolve-icon"/>

                            <h2>
                                Decline Account
                            </h2>

                        </div>




                        <div className="resolve-body">


                            <p>
                                Are you sure you want to decline this account?
                            </p>


                            <div className="resolve-warning">

                                {declineRequest.firstName}{" "}
                                {declineRequest.lastName}
                                {" "}will not be able to access MollyTech Service Desk.

                            </div>


                            <textarea

                                className="decline-reason"

                                placeholder="Enter reason for declining this account..."

                                value={declineReason}

                                onChange={(e)=>
                                    setDeclineReason(e.target.value)
                                }

                            />

                        </div>

                        <div className="resolve-actions">


                            <button

                                className="btn-cancel"

                                onClick={()=>
                                    setDeclineRequest(null)
                                }

                            >

                                Cancel

                            </button>




                            <button

                                className="btn-confirm-resolve"

                                onClick={()=>{

                                    handleDecline(
                                        declineRequest._id
                                    );

                                    setDeclineRequest(null);

                                }}

                            >

                                Decline Account

                            </button>


                        </div>


                    </div>


                </div>

            )}



        </div>

    );

}