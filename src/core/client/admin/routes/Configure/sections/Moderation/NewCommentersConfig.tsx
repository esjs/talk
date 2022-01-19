import { Localized } from "@fluent/react/compat";
import React, { FunctionComponent } from "react";
import { Field } from "react-final-form";
import { graphql } from "react-relay";

import {
  formatBool,
  parseInteger,
  parseStringBool,
  ValidationMessage,
} from "coral-framework/lib/form";
import { withFragmentContainer } from "coral-framework/lib/relay";
import {
  composeValidators,
  Condition,
  required,
  validateWholeNumberGreaterThan,
} from "coral-framework/lib/validation";
import { GQLMODERATION_MODE } from "coral-framework/schema";
import {
  FieldSet,
  FormField,
  FormFieldDescription,
  Label,
  TextField,
} from "coral-ui/components/v2";

import AllSpecificOffSitesField from "./AllSpecificOffSitesField";
import ConfigBox from "../../ConfigBox";
import Header from "../../Header";
import OnOffField from "../../OnOffField";

import { NewCommentersConfig_settings } from "coral-admin/__generated__/NewCommentersConfig_settings.graphql";

import styles from "./NewCommentersConfig.css";

interface Props {
  disabled: boolean;
  settings: NewCommentersConfig_settings;
}

// eslint-disable-next-line no-unused-expressions
graphql`
  fragment NewCommentersConfigContainer_formValues on Settings {
    newCommenters {
      premodEnabled
      approvedCommentsThreshold
      moderation {
        mode
        premodSites
      }
    }
  }
`;

const parse = (v: string) => {
  return parseStringBool(v) ? "PRE" : "POST";
};

const format = (v: "PRE" | "POST") => {
  return formatBool(v === "PRE");
};

const specificSitesIsEnabled: Condition = (_value, values) => {
  return Boolean(
    values.newCommenters.moderation &&
      values.newCommenters.moderation.mode ===
        GQLMODERATION_MODE.SPECIFIC_SITES_PRE
  );
};

const NewCommentersConfig: FunctionComponent<Props> = ({
  disabled,
  settings,
}) => {
  return (
    <ConfigBox
      id="Users"
      title={
        <Localized id="configure-moderation-newCommenters-title">
          <Header container="legend">New commenter approval</Header>
        </Localized>
      }
    >
      <Localized id="configure-moderation-newCommenters-description">
        <FormFieldDescription>
          When this is active, initial comments by a new commenter will be sent
          to Pending for moderator approval before publication.
        </FormFieldDescription>
      </Localized>
      <FormField container={<FieldSet />}>
        <Localized id="configure-moderation-newCommenters-enable">
          <Label component="legend">Enable new commenter approval</Label>
        </Localized>
        {settings.multisite ? (
          <AllSpecificOffSitesField
            disabled={disabled}
            moderationFieldName="newCommenters.moderation.mode"
            specificSitesFieldName="newCommenters.moderation.premodSites"
            specificSitesIsEnabledCondition={specificSitesIsEnabled}
          />
        ) : (
          <OnOffField
            name="newCommenters.moderation.mode"
            disabled={disabled}
            parse={parse}
            format={format}
          />
        )}
      </FormField>
      <FormField>
        <Localized id="configure-moderation-newCommenters-approvedCommentsThreshold">
          <Label>Number of comments that must be approved</Label>
        </Localized>
        <Field
          name="newCommenters.approvedCommentsThreshold"
          validate={composeValidators(
            required,
            validateWholeNumberGreaterThan(1)
          )}
          parse={parseInteger}
        >
          {({ input, meta }) => (
            <>
              <TextField
                classes={{
                  input: styles.thresholdTextField,
                }}
                disabled={disabled}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                textAlignCenter
                adornment={
                  <Localized id="configure-moderation-newCommenters-comments">
                    comments
                  </Localized>
                }
                {...input}
              />
              <ValidationMessage meta={meta} />
            </>
          )}
        </Field>
      </FormField>
    </ConfigBox>
  );
};

const enhanced = withFragmentContainer<Props>({
  settings: graphql`
    fragment NewCommentersConfig_settings on Settings {
      multisite
    }
  `,
})(NewCommentersConfig);

export default enhanced;
