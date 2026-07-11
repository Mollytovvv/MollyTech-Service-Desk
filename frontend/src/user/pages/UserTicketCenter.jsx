import { useEffect, useState } from "react";

import CreateTicketModal from "../components/CreateTicketModal";

import api from "../../api/axios";

import "../styles/UserTicketCenter.css";


export default function UserTicketCenter() {


  const [showCreateModal, setShowCreateModal] = useState(false);

  const [tickets, setTickets] = useState([]);

  const [loading, setLoading] = useState(true);



  // ===============================
  // FETCH USER TICKETS
  // ===============================

  const fetchTickets = async () => {

    try {

      setLoading(true);


      const response = await api.get(
        "/tickets/my"
      );


      setTickets(
        response.data.tickets
      );


    } catch (error) {


      console.log(
        "FETCH TICKETS ERROR:",
        error.response?.data || error.message
      );


    } finally {

      setLoading(false);

    }

  };



  useEffect(() => {

    fetchTickets();

  }, []);



  return (

    <div className="user-ticket-center">


      {/* HEADER */}

      <section className="ticket-center-header">

        <div>

          <h2>
            My Tickets
          </h2>


          <p>
            Track and manage your support requests.
          </p>


        </div>



        <button

          className="create-ticket-btn"

          onClick={() =>
            setShowCreateModal(true)
          }

        >

          + Create Ticket

        </button>


      </section>





      {/* TOOLBAR */}

      <section className="ticket-toolbar">


        <input

          type="text"

          placeholder="Search tickets..."

        />



        <select>

          <option>
            All Status
          </option>

        </select>



        <select>

          <option>
            All Priority
          </option>

        </select>



        <select>

          <option>
            All Categories
          </option>

        </select>


      </section>





      {/* TICKETS */}


      <section className="ticket-table">


        {
          loading ? (

            <div className="empty-state">

              <h3>
                Loading tickets...
              </h3>

            </div>


          ) : tickets.length === 0 ? (


            <div className="empty-state">

              <h3>
                No tickets yet
              </h3>


              <p>
                Create your first support ticket.
              </p>


            </div>


          ) : (


            <div className="user-ticket-list">


            {
            tickets.map((ticket) => (

                <div

                className="user-ticket-card"

                key={ticket._id}

                >


                <div className="user-ticket-info">


                    <h3>
                    {ticket.ticketId}
                    </h3>


                    <p>
                    {ticket.title}
                    </p>


                </div>




                <div className="user-ticket-meta">


                    <span className="user-ticket-category">

                    {ticket.category}

                    </span>



                    <span className="user-ticket-priority">

                    {ticket.priority}

                    </span>



                    <span

                    className={`user-status-${ticket.status}`}

                    >

                    {ticket.status}

                    </span>


                </div>


                </div>

            ))

            }


            </div>


          )
        }



      </section>





      {/* CREATE MODAL */}


      {
        showCreateModal && (

          <CreateTicketModal

            onClose={() => {

              setShowCreateModal(false);

              fetchTickets();

            }}

          />

        )
      }


    </div>

  );

}