import "./ApprovalModal.css";


export default function ApprovalModal({ onClose }) {


    return (

        <div className="approval-overlay">


            <div className="approval-modal">


                <div className="approval-icon">

                    ✓

                </div>



                <h2>

                    Registration Submitted

                </h2>



                <p>

                    Your account has been created and is currently
                    waiting for administrator approval.

                    <br />
                    <br />

                    You will receive an email once your account
                    has been approved.

                </p>



                <button

                    className="approval-btn"

                    onClick={onClose}

                >

                    Back to Login


                </button>



            </div>


        </div>

    );

}