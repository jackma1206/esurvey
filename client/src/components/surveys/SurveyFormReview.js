import _ from "lodash";
import React from "react";
import { connect } from "react-redux";
import FIELDS from "./formFields";
import * as actions from "../../actions";
import { withRouter } from "react-router-dom";

const SurveyReview = props => {
  const reviewFields = _.map(FIELDS, field => {
    return (
      <div key={field.name}>
        <label>{field.label}</label>
        <div>{props.formValues[field.name]}</div>
      </div>
    );
  });
  return (
    <div>
      <h5>Please confirm your entries</h5>
      {reviewFields}
      <button
        className="yellow btn-flat darken-3 white-text"
        onClick={props.onCancel}
      >
        Cancel
      </button>
      <button
        onClick={() => {
          props.submitSurvey(props.formValues, props.history);
        }}
        className="green btn-flat right white-text"
      >
        Send Survey
        <i className="material-icons right">email</i>
      </button>
    </div>
  );
};
function mapStateToProps(state) {
  return { formValues: state.form.surveyForm.values };
}

//actions are also in props
export default connect(
  mapStateToProps,
  actions
)(withRouter(SurveyReview));
