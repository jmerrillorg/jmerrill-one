var Jm1ProductionsBp09Review = (function () {
  "use strict";

  function guid(value) {
    return String(value || "").replace(/[{}]/g, "").toLowerCase();
  }

  async function accept(primaryControl) {
    var form = primaryControl;
    var leadId = guid(form && form.data && form.data.entity.getId());
    if (!/^[0-9a-f-]{36}$/.test(leadId)) return;
    var record;
    try {
      record = await Xrm.WebApi.retrieveRecord("lead", leadId,
        "?$select=leadid,statuscode,versionnumber,jm1_bp09intakereceiptid");
    } catch (_) {
      await Xrm.Navigation.openAlertDialog({ text: "The inquiry could not be loaded. Please refresh and try again." });
      return;
    }
    var receiptId = guid(record.jm1_bp09intakereceiptid);
    if (record.statuscode !== 1 || !/^[0-9a-f-]{36}$/.test(receiptId)) {
      await Xrm.Navigation.openAlertDialog({ text: "This inquiry is not eligible for the initial follow-up action." });
      return;
    }
    var decision = await Xrm.Navigation.openConfirmDialog({
      title: "Accept for follow-up",
      text: "Take responsibility for reviewing this Productions inquiry? This does not record client contact.",
      confirmButtonLabel: "Accept",
      cancelButtonLabel: "Cancel"
    });
    if (!decision.confirmed) return;
    function AcceptRequest() {
      this.LeadId = leadId;
      this.ReceiptId = receiptId;
      this.IdempotencyKey = receiptId;
      this.ExpectedVersion = String(record.versionnumber);
      this.ActionId = "ACCEPT_FOR_FOLLOW_UP";
    }
    AcceptRequest.prototype.getMetadata = function () {
      return {
          boundParameter: null,
          parameterTypes: {
            LeadId: { typeName: "Edm.Guid", structuralProperty: 5 },
            ReceiptId: { typeName: "Edm.Guid", structuralProperty: 5 },
            IdempotencyKey: { typeName: "Edm.Guid", structuralProperty: 5 },
            ExpectedVersion: { typeName: "Edm.String", structuralProperty: 1 },
            ActionId: { typeName: "Edm.String", structuralProperty: 1 }
          },
          operationType: 0,
          operationName: "jm1_AcceptProductionsInquiry"
      };
    };
    try {
      var response = await Xrm.WebApi.online.execute(new AcceptRequest());
      if (!response.ok) throw new Error("Action rejected");
      var result = await response.json();
      if (result.Outcome !== "ACCEPTED" && result.Outcome !== "REPLAY")
        throw new Error("Unexpected action outcome");
      await form.data.refresh(false);
      await Xrm.Navigation.openAlertDialog({
        text: result.Outcome === "REPLAY"
          ? "This inquiry was already accepted for follow-up."
          : "Inquiry accepted for follow-up. The action is recorded."
      });
    } catch (error) {
      console.error("PRD_REVIEW_ACTION_FAILED", error && error.errorCode);
      await Xrm.Navigation.openAlertDialog({
        text: "The action could not be verified. Refresh the inquiry before retrying or contact operations."
      });
    }
  }

  return { accept: accept };
})();
