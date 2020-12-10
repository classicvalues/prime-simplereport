import { gql, useQuery } from "@apollo/client";
import React from "react";

import { displayFullName } from "../utils";

import { NavLink } from "react-router-dom";

// this can't be the best way to handle this?
import {
  PATIENT_TERM_CAP,
  PATIENT_TERM_PLURAL_CAP,
} from "../../config/constants";

const patientQuery = gql`
  query Patient($facilityId: String!) {
    patients(facilityId: $facilityId) {
      internalId
      lookupId
      firstName
      lastName
      middleName
      birthDate
    }
  }
`;

interface Props {
  activeFacilityId: string;
}

const ManagePatients = ({ activeFacilityId }: Props) => {
  const { data, loading, error } = useQuery(patientQuery, {
    fetchPolicy: "no-cache",
    variables: {
      facilityId: activeFacilityId,
    },
  });

  const patientRows = (patients: any) => {
    return patients.map((patient: any) => (
      <tr key={patient.internalId}>
        <th scope="row">
          <NavLink to={`patient/${patient.internalId}`}>
            {displayFullName(
              patient.firstName,
              patient.middleName,
              patient.lastName
            )}
          </NavLink>
        </th>
        <td>{patient.lookupId}</td>
        <td> {patient.birthDate}</td>
        <td>
          {patient.lastTestDate === undefined
            ? "N/A"
            : `${patient.lastTestDate} days`}
        </td>
      </tr>
    ));
  };

  return (
    <main className="prime-home">
      <div className="grid-container">
        <div className="grid-row">
          <div className="prime-container usa-card__container">
            <div className="usa-card__header">
              <h2> Add New {PATIENT_TERM_CAP}</h2>
            </div>
            <div className="usa-card__body">
              <div style={{ display: "inline-block" }}>
                <NavLink className="usa-button" to={"add-patient"}>
                  New {PATIENT_TERM_CAP}
                </NavLink>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="grid-container">
        <div className="grid-row">
          <div className="prime-container usa-card__container">
            <div className="usa-card__header">
              <h2> All {PATIENT_TERM_PLURAL_CAP}</h2>
            </div>
            <div className="usa-card__body">
              {error ? (
                <p>Error in loading patients</p>
              ) : loading ? (
                <p>Loading patients...</p>
              ) : data ? (
                <table className="usa-table usa-table--borderless width-full">
                  <thead>
                    <tr>
                      <th scope="col">Name</th>
                      <th scope="col">Unique ID</th>
                      <th scope="col">Date of Birth</th>
                      <th scope="col">Days since last test</th>
                    </tr>
                  </thead>
                  <tbody>{patientRows(data.patients)}</tbody>
                </table>
              ) : (
                <p> no patients found</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ManagePatients;