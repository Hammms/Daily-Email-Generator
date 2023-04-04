# Daily Email Generator Tools

You'll need:

1. `PutObject` or greater permissions to interact with the AWS bucket. If you are an admin, that works as well.
2. The [MJML API Credentials](https://mjml.io/api/)


## The Daily Hearse

1. Make any changes necessary to [`dailyhearse/index.js`](dailyhearse/index.js)
2. At your command prompt, run `yarn dh:upload`
3. Continue with either the MailChimp API flow below or create the campaign in the browser at <https://us4.admin.mailchimp.com/campaigns>

### MailChimp API Flow

_Be sure to replace the placeholders in brackets with the proper values_

1. Create Campaign

```bash
## 1. Create Campaign
# <https://mailchimp.com/developer/marketing/api/campaigns/add-campaign/>
curl -X "POST" "https://us4.api.mailchimp.com/3.0/campaigns" \
     -H 'Content-Type: application/json' \
     -u '[ANY_STRING]:[MAILCHIMP_API_KEY]' \
     -d $'{"tracking": {"opens": true,"html_clicks": true,"text_clicks": true},"type": "regular","recipients": {"list_id":"8d84244dad"},"settings": {"auto_tweet": true,"reply_to": "ryan@connectingdirectors.com",
    "to_name": "*|FNAME|*",
    "from_name": "The Daily Hearse",
    "title": "[INTERNAL_TITLE]",
    "subject_line": "[SUBJECT_LINE]",
    "preview_text": "[PREVIEW_TEXT]"
  },
}'
```

2. Update Campaign Content

```bash
## 3. Update Campaign Content
# <https://mailchimp.com/developer/marketing/api/campaign-content/set-campaign-content/>
curl -X "PUT" "https://us4.api.mailchimp.com/3.0/campaigns/7d07ff93e4/content" \
     -H 'Content-Type: application/json' \
     -u '[ANY_STRING]:[MAILCHIMP_API_KEY]' \
     -d $'{
  "url": "[AWS_S3_OBJECT_URL]"
}'
```

## Death Care Jobs Job Alerts

## Friday Funeral Fast Wrap (FFFW)
