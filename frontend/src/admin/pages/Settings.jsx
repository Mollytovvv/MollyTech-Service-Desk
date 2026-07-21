import "../styles/Settings.css";


export default function Settings(){


  return (

    <div className="settings-page">

      {/* =========================
          SETTINGS WORKSPACE
      ========================= */}

      <div className="settings-workspace">





        {/* =========================
            LEFT SETTINGS AREA
        ========================= */}

        <div className="settings-grid">





          {/* =========================
              PROFILE
          ========================= */}

          <section className="settings-card">


            <div className="settings-card-header">

              <i className="fa-solid fa-user-shield"/>


              <h2>
                Profile
              </h2>


            </div>




            <div className="settings-card-body">



              <div className="profile-summary">


                <div className="profile-logo">

                  <i className="fa-solid fa-building"/>

                </div>



                <div className="profile-details">

                  <h3>
                    MollyTech Service Desk
                  </h3>


                  <p>
                    mollytech.sd@gmail.com
                  </p>


                </div>


              </div>





            <div className="settings-form">

            <div className="settings-field">

                <label>
                Display Name
                </label>

                <div className="settings-value">

                MollyTech Service Desk

                </div>

            </div>

                <div className="settings-role">

                  <span>
                    Role
                  </span>


                  <strong>
                    Administrator
                  </strong>


                </div>

              </div>



            </div>


          </section>







          {/* =========================
              SECURITY
          ========================= */}

          <section className="settings-card security-card">


            <div className="settings-card-header">

              <i className="fa-solid fa-lock"/>


              <h2>
                Security
              </h2>


            </div>




            <div className="settings-card-body">


              <div className="settings-form">


                <div className="settings-field">

                  <label>
                    Current Password
                  </label>


                  <input
                    type="password"
                    placeholder="Enter current password"
                  />


                </div>




                <div className="settings-field">

                  <label>
                    New Password
                  </label>


                  <input
                    type="password"
                    placeholder="Enter new password"
                  />


                </div>




                <div className="settings-field">

                  <label>
                    Confirm Password
                  </label>


                  <input
                    type="password"
                    placeholder="Confirm password"
                  />


                </div>




                <button className="settings-save-btn">

                  Update Password

                </button>



              </div>



            </div>


          </section>

        </div>

        {/* =========================
            ABOUT PANEL
        ========================= */}

        <aside className="settings-about">


          <div className="about-header">


            <i className="fa-solid fa-circle-info"/>


            <h2>
              About MollyTech
            </h2>


          </div>




          <div className="about-content">


            <h3>
              MollyTech Service Desk System
            </h3>



            <p>
              A centralized IT support platform designed to manage tickets, conversations, and support workflows.
            </p>



            <div className="about-item">

              <span>
                Version
              </span>


              <strong>
                1.0.0
              </strong>


            </div>




            <div className="about-item">

              <span>
                Frontend
              </span>


              <strong>
                React + Vite
              </strong>


            </div>




            <div className="about-item">

              <span>
                Backend
              </span>


              <strong>
                Node.js + Express
              </strong>


            </div>




            <div className="about-item">

              <span>
                Database
              </span>


              <strong>
                MongoDB
              </strong>

            </div>

            <div className="about-item">

              <span>
                Developer
              </span>


              <strong>
                Ralph Michael Molina
              </strong>

            </div>



          </div>



        </aside>



      </div>



    </div>

  );

}