export const commonEvent ={
  "id": "ID-dual-stream-demo",
  "org": "mh_default_org",
  "metadata": {
    "title": "Dual-Stream Demo",
    "description": "Description\nLine 2\nLine 3",
    "license": "CC-BY-SA",
    "series": "ID-openmedia-opencast",
    "seriesTitle": "Open Media for Opencast",
    "presenters": [
      "Lars Kiesow",
      "Presenter 2",
      "Presenter 3"
    ],
    "contributors": [
      "Contributor 1",
      "Contributor 2",
      "Contributor 3"
    ],
    "startDate": new Date("2025-06-19T00:03:00.000Z"),
    "duration": 64711,
    "location": "location",
    "source": "source",
    "created": new Date("2025-06-19T00:03:00.000Z"),
    "publisher": "TODO: publisher"
  },
  "tracks": [
    {
      "id": "3d1404ac-c7d6-462b-8d8c-012d14e8a02a",
      "url": "https://develop.opencast.org/static/mh_default_org/engage-player/ID-dual-stream-demo/ce3279fc-ffff-4e86-9262-d55a5c3e14e3/dualstream.vtt",
      "mimetype": "text/vtt",
      "flavor": "captions/source+en",
      "tags": [],
      "checksum": {
        "type": "md5",
        "value": "f4574d045290de640e5e02131d5a1a36"
      },
      "size": 1051,
      "is_master": false,
      "is_live": false,
      "duration": 0
    },
    {
      "id": "8f98ba90-b6f1-471d-b890-fd09ea10e630",
      "url": "https://develop.opencast.org/static/mh_default_org/engage-player/ID-dual-stream-demo/227ccb35-e8e6-45a9-9eae-e89908a4c59b/dualstream-presenter.mp4",
      "mimetype": "video/mp4",
      "flavor": "presenter/preview",
      "tags": [
        "atom",
        "default",
        "engage-download",
        "engage-streaming",
        "rss"
      ],
      "ref": "track:d47b65a2-5954-498f-abac-76b29f0772ed",
      "checksum": {
        "type": "md5",
        "value": "d9d29542519291c9f9d2ea19d9dc270c"
      },
      "size": 9184722,
      "is_master": false,
      "is_live": false,
      "duration": 64.711,
      "audio": {
        "id": "audio-1",
        "device": "",
        "encoder": {
          "type": "AAC (Advanced Audio Coding)"
        },
        "framecount": 3035,
        "channels": 1,
        "samplingrate": 48000,
        "bitrate": 69930
      },
      "video": {
        "id": "video-1",
        "device": "",
        "encoder": {
          "type": "H.264 / AVC / MPEG-4 AVC / MPEG-4 part 10"
        },
        "framecount": 1939,
        "bitrate": 1057856,
        "framerate": 30,
        "width": 1280,
        "height": 720
      }
    },
    {
      "id": "a5e49606-59ab-4289-81b3-5b19f8ad7a0d",
      "url": "https://develop.opencast.org/static/mh_default_org/engage-player/ID-dual-stream-demo/9a463446-f2f6-487b-ac3a-122ab4ba8e11/dualstream-presentation.mp4",
      "mimetype": "video/mp4",
      "flavor": "presentation/preview",
      "tags": [
        "atom",
        "default",
        "engage-download",
        "engage-streaming",
        "rss"
      ],
      "ref": "track:0278a658-fe0b-4aaa-9b95-7486eaee2201",
      "checksum": {
        "type": "md5",
        "value": "b2ac76f582d7d29f7b038d19c621a5cf"
      },
      "size": 3691422,
      "is_master": false,
      "is_live": false,
      "duration": 64.711,
      "audio": {
        "id": "audio-1",
        "device": "",
        "encoder": {
          "type": "AAC (Advanced Audio Coding)"
        },
        "framecount": 3035,
        "channels": 1,
        "samplingrate": 48000,
        "bitrate": 69930
      },
      "video": {
        "id": "video-1",
        "device": "",
        "encoder": {
          "type": "H.264 / AVC / MPEG-4 AVC / MPEG-4 part 10"
        },
        "framecount": 1937,
        "bitrate": 378296,
        "framerate": 30,
        "width": 1920,
        "height": 1080
      }
    }
  ],
  "attachments": [
    {
      "id": "b3404bcf-754a-4402-8008-5b3a5df1fd3a",
      "url": "https://develop.opencast.org/static/mh_default_org/engage-player/ID-dual-stream-demo/beb654fb-0f84-468a-9577-e044585cf327/episode-security.xml",
      "mimetype": "text/xml",
      "flavor": "security/xacml+episode",
      "tags": [
        "archive"
      ],
      "checksum": {
        "type": "md5",
        "value": "9c8adf965b0e2c5cada64b1fb96d4197"
      }
    },
    {
      "id": "4c261363-26cd-4819-84a0-0ebcef3fa25e",
      "url": "https://develop.opencast.org/static/mh_default_org/engage-player/ID-dual-stream-demo/security-policy-series/xacml.xml",
      "mimetype": "text/xml",
      "flavor": "security/xacml+series",
      "tags": [
        "archive"
      ],
      "checksum": {
        "type": "md5",
        "value": "1fafd1174c29792ff5d34b535846a2f5"
      }
    },
    {
      "id": "6703ea18-e239-4d6a-a6db-38f400c2b94a",
      "url": "https://develop.opencast.org/static/mh_default_org/engage-player/ID-dual-stream-demo/2d1dbdeb-dc77-4a5e-80c7-e9bf8dd07ff7/dualstream-presentation.jpg",
      "mimetype": "image/jpeg",
      "flavor": "presentation/segment+preview",
      "tags": [
        "engage-download"
      ],
      "ref": "track:0278a658-fe0b-4aaa-9b95-7486eaee2201;time=T00:00:23:716F1000",
      "size": 2039
    },
    {
      "id": "cd502d4a-b71d-478a-a480-b65e30de9198",
      "url": "https://develop.opencast.org/static/mh_default_org/engage-player/ID-dual-stream-demo/2e265421-533f-4b8d-840e-02c6eec883cc/dualstream-presentation.jpg",
      "mimetype": "image/jpeg",
      "flavor": "presentation/segment+preview",
      "tags": [
        "engage-download"
      ],
      "ref": "track:0278a658-fe0b-4aaa-9b95-7486eaee2201;time=T00:00:32:340F1000",
      "size": 2101
    },
    {
      "id": "984dc7a9-2bff-469b-8184-fe3631c7739a",
      "url": "https://develop.opencast.org/static/mh_default_org/engage-player/ID-dual-stream-demo/5bd99724-f5a3-4115-8177-225e87256322/dualstream-presentation.jpg",
      "mimetype": "image/jpeg",
      "flavor": "presentation/segment+preview",
      "tags": [
        "engage-download"
      ],
      "ref": "track:0278a658-fe0b-4aaa-9b95-7486eaee2201;time=T00:00:06:468F1000",
      "size": 2546
    },
    {
      "id": "69f6905e-cfb7-4030-89b9-bbcf33b1c775",
      "url": "https://develop.opencast.org/static/mh_default_org/engage-player/ID-dual-stream-demo/e48e3ef5-4680-4774-9347-39e45068db86/dualstream-presentation.jpg",
      "mimetype": "image/jpeg",
      "flavor": "presentation/segment+preview",
      "tags": [
        "engage-download"
      ],
      "ref": "track:0278a658-fe0b-4aaa-9b95-7486eaee2201;time=T00:00:12:936F1000",
      "size": 2553
    },
    {
      "id": "adbfcafa-e3ab-4611-8748-d65aedfbd997",
      "url": "https://develop.opencast.org/static/mh_default_org/engage-player/ID-dual-stream-demo/bfb113ba-2ca2-44ca-beb7-0b8c795ea560/dualstream-presentation.jpg",
      "mimetype": "image/jpeg",
      "flavor": "presentation/segment+preview",
      "tags": [
        "engage-download"
      ],
      "ref": "track:0278a658-fe0b-4aaa-9b95-7486eaee2201;time=T00:00:15:92F1000",
      "size": 3117
    },
    {
      "id": "701d11b3-ebc3-4719-80d9-84a5e82d167a",
      "url": "https://develop.opencast.org/static/mh_default_org/engage-player/ID-dual-stream-demo/3f1f8744-f217-4755-ada2-d311b4a6a476/dualstream-presentation.jpg",
      "mimetype": "image/jpeg",
      "flavor": "presentation/segment+preview",
      "tags": [
        "engage-download"
      ],
      "ref": "track:0278a658-fe0b-4aaa-9b95-7486eaee2201;time=T00:00:02:156F1000",
      "size": 2434
    },
    {
      "id": "860cb8d6-e90f-48f8-93a2-a96bb7a13c1b",
      "url": "https://develop.opencast.org/static/mh_default_org/engage-player/ID-dual-stream-demo/c34be8e4-fc47-444a-8ba3-a5f6f3f525a0/dualstream-presentation.jpg",
      "mimetype": "image/jpeg",
      "flavor": "presentation/segment+preview",
      "tags": [
        "engage-download"
      ],
      "ref": "track:0278a658-fe0b-4aaa-9b95-7486eaee2201;time=T00:00:43:120F1000",
      "size": 2141
    },
    {
      "id": "63eff8cb-34fd-4bfc-9072-c3848bfe3825",
      "url": "https://develop.opencast.org/static/mh_default_org/engage-player/ID-dual-stream-demo/7d94be68-762d-42d1-9ee4-ab6741ca34b6/dualstream-presentation.jpg",
      "mimetype": "image/jpeg",
      "flavor": "presentation/segment+preview",
      "tags": [
        "engage-download"
      ],
      "ref": "track:0278a658-fe0b-4aaa-9b95-7486eaee2201;time=T00:00:58:212F1000",
      "size": 2147
    },
    {
      "id": "5870e298-670a-4a87-9ca7-ebfd46fb84ea",
      "url": "https://develop.opencast.org/static/mh_default_org/engage-player/ID-dual-stream-demo/0e8ab5aa-512b-444e-ba07-046ed42c66f3/dualstream-presentation.jpg",
      "mimetype": "image/jpeg",
      "flavor": "presentation/segment+preview",
      "tags": [
        "engage-download"
      ],
      "ref": "track:0278a658-fe0b-4aaa-9b95-7486eaee2201;time=T00:00:04:312F1000",
      "size": 2437
    },
    {
      "id": "51572d04-ae22-4071-99e5-95572e18296e",
      "url": "https://develop.opencast.org/static/mh_default_org/engage-player/ID-dual-stream-demo/dd4ddc4d-dc3a-44c5-bd13-bcd63d328d3e/dualstream-presentation.jpg",
      "mimetype": "image/jpeg",
      "flavor": "presentation/segment+preview",
      "tags": [
        "engage-download"
      ],
      "ref": "track:0278a658-fe0b-4aaa-9b95-7486eaee2201;time=T00:00:28:28F1000",
      "size": 2050
    },
    {
      "id": "a446e1bc-2586-4de0-b5f5-93f2fffac0c3",
      "url": "https://develop.opencast.org/static/mh_default_org/engage-player/ID-dual-stream-demo/adf8885a-7dba-48ba-9f94-0145c5349dcd/dualstream-presentation.jpg",
      "mimetype": "image/jpeg",
      "flavor": "presentation/segment+preview",
      "tags": [
        "engage-download"
      ],
      "ref": "track:0278a658-fe0b-4aaa-9b95-7486eaee2201;time=T00:00:34:496F1000",
      "size": 999
    },
    {
      "id": "e0782acb-3b97-4076-adb1-f5d4d6281ab0",
      "url": "https://develop.opencast.org/static/mh_default_org/engage-player/ID-dual-stream-demo/b11b771f-f1eb-463d-9682-ec56247abebe/dualstream-presentation.jpg",
      "mimetype": "image/jpeg",
      "flavor": "presentation/segment+preview",
      "tags": [
        "engage-download"
      ],
      "ref": "track:0278a658-fe0b-4aaa-9b95-7486eaee2201;time=T00:01:00:368F1000",
      "size": 2145
    },
    {
      "id": "a83e2c7e-2375-49e4-9d9c-c897014d0abb",
      "url": "https://develop.opencast.org/static/mh_default_org/engage-player/ID-dual-stream-demo/8d603d32-469d-4e0d-9bb7-796e9a2897e9/dualstream-presentation.jpg",
      "mimetype": "image/jpeg",
      "flavor": "presentation/segment+preview",
      "tags": [
        "engage-download"
      ],
      "ref": "track:0278a658-fe0b-4aaa-9b95-7486eaee2201;time=T00:00:30:184F1000",
      "size": 2105
    },
    {
      "id": "0596f760-df3b-440c-b9a5-b49d35187818",
      "url": "https://develop.opencast.org/static/mh_default_org/engage-player/ID-dual-stream-demo/99525b5d-dc81-4822-bf01-7424091a7489/dualstream-presentation.jpg",
      "mimetype": "image/jpeg",
      "flavor": "presentation/segment+preview",
      "tags": [
        "engage-download"
      ],
      "ref": "track:0278a658-fe0b-4aaa-9b95-7486eaee2201;time=T00:00:45:276F1000",
      "size": 2140
    },
    {
      "id": "0313845c-7576-451b-ace5-a8128e3b82d6",
      "url": "https://develop.opencast.org/static/mh_default_org/engage-player/ID-dual-stream-demo/c947308f-d9b4-43a6-a5c3-5460f8bf0d54/dualstream-presentation.jpg",
      "mimetype": "image/jpeg",
      "flavor": "presentation/segment+preview",
      "tags": [
        "engage-download"
      ],
      "ref": "track:0278a658-fe0b-4aaa-9b95-7486eaee2201;time=T00:00:08:624F1000",
      "size": 2555
    },
    {
      "id": "4bcf732e-060e-4f14-b712-0986d27bff77",
      "url": "https://develop.opencast.org/static/mh_default_org/engage-player/ID-dual-stream-demo/efcd114a-8f8b-4aac-96b8-56f8ded8ddb6/dualstream-presentation.jpg",
      "mimetype": "image/jpeg",
      "flavor": "presentation/segment+preview",
      "tags": [
        "engage-download"
      ],
      "ref": "track:0278a658-fe0b-4aaa-9b95-7486eaee2201;time=T00:00:49:588F1000",
      "size": 2143
    },
    {
      "id": "1ba6f65c-f97d-42a9-9d81-36112a836efc",
      "url": "https://develop.opencast.org/static/mh_default_org/engage-player/ID-dual-stream-demo/230fafc0-1be0-4d96-986c-a29f71c8a24c/dualstream-presentation.jpg",
      "mimetype": "image/jpeg",
      "flavor": "presentation/segment+preview",
      "tags": [
        "engage-download"
      ],
      "ref": "track:0278a658-fe0b-4aaa-9b95-7486eaee2201;time=T00:00:25:872F1000",
      "size": 2039
    },
    {
      "id": "fdb2fb2e-f5e8-477e-9852-77fdfd645625",
      "url": "https://develop.opencast.org/static/mh_default_org/engage-player/ID-dual-stream-demo/f19e4957-af6e-4f57-b82f-a9e9d1703950/dualstream-presentation.jpg",
      "mimetype": "image/jpeg",
      "flavor": "presentation/segment+preview",
      "tags": [
        "engage-download"
      ],
      "ref": "track:0278a658-fe0b-4aaa-9b95-7486eaee2201;time=T00:00:47:432F1000",
      "size": 2147
    },
    {
      "id": "f6bfc191-150b-4cac-96ad-f9309befbc80",
      "url": "https://develop.opencast.org/static/mh_default_org/engage-player/ID-dual-stream-demo/1536ae50-d325-4f87-a20b-05ee38fbe1b7/dualstream-presentation.jpg",
      "mimetype": "image/jpeg",
      "flavor": "presentation/segment+preview",
      "tags": [
        "engage-download"
      ],
      "ref": "track:0278a658-fe0b-4aaa-9b95-7486eaee2201;time=T00:00:38:808F1000",
      "size": 2143
    },
    {
      "id": "15f0c54d-3f0a-48ab-a44f-a66ddd03cb19",
      "url": "https://develop.opencast.org/static/mh_default_org/engage-player/ID-dual-stream-demo/d74261e6-b4bb-4dad-9792-01792e558504/dualstream-presentation.jpg",
      "mimetype": "image/jpeg",
      "flavor": "presentation/segment+preview",
      "tags": [
        "engage-download"
      ],
      "ref": "track:0278a658-fe0b-4aaa-9b95-7486eaee2201;time=T00:00:40:964F1000",
      "size": 2141
    },
    {
      "id": "ec968ada-8e30-44de-8116-2a61dc163b88",
      "url": "https://develop.opencast.org/static/mh_default_org/engage-player/ID-dual-stream-demo/e2a41645-5728-4b33-8d81-dcd622016fb1/dualstream-presentation.jpg",
      "mimetype": "image/jpeg",
      "flavor": "presentation/segment+preview",
      "tags": [
        "engage-download"
      ],
      "ref": "track:0278a658-fe0b-4aaa-9b95-7486eaee2201;time=T00:00:56:56F1000",
      "size": 2147
    },
    {
      "id": "4f7ea93a-1abb-4daa-bc7e-c83c3e19c1ca",
      "url": "https://develop.opencast.org/static/mh_default_org/engage-player/ID-dual-stream-demo/1b5e4e0e-8a9b-4865-9591-743457e543f7/dualstream-presentation_1.000s-search.jpg",
      "mimetype": "image/jpeg",
      "flavor": "presentation/search+preview",
      "tags": [
        "engage-download"
      ],
      "ref": "track:0278a658-fe0b-4aaa-9b95-7486eaee2201",
      "size": 2453
    },
    {
      "id": "458ea9b6-d695-40cc-bd6a-1648c6c06f1b",
      "url": "https://develop.opencast.org/static/mh_default_org/engage-player/ID-dual-stream-demo/3553727d-cc2a-4977-8181-d7773dadde2a/dualstream-presentation.jpg",
      "mimetype": "image/jpeg",
      "flavor": "presentation/segment+preview",
      "tags": [
        "engage-download"
      ],
      "ref": "track:0278a658-fe0b-4aaa-9b95-7486eaee2201;time=T00:00:10:780F1000",
      "size": 2555
    },
    {
      "id": "cc0c14c6-c87b-4aaf-9d4f-c684baaaba6c",
      "url": "https://develop.opencast.org/static/mh_default_org/engage-player/ID-dual-stream-demo/1ec4c681-3325-4f70-a39b-6eb58cdde7e2/dualstream-presentation.jpg",
      "mimetype": "image/jpeg",
      "flavor": "presentation/segment+preview",
      "tags": [
        "engage-download"
      ],
      "ref": "track:0278a658-fe0b-4aaa-9b95-7486eaee2201;time=T00:00:51:744F1000",
      "size": 2142
    },
    {
      "id": "34c484c6-244d-4373-9b60-62e36ebeb453",
      "url": "https://develop.opencast.org/static/mh_default_org/engage-player/ID-dual-stream-demo/48804e5e-9651-4f5a-ab5c-f9719af78015/dualstream-presentation.jpg",
      "mimetype": "image/jpeg",
      "flavor": "presentation/segment+preview",
      "tags": [
        "engage-download"
      ],
      "ref": "track:0278a658-fe0b-4aaa-9b95-7486eaee2201;time=T00:00:36:652F1000",
      "size": 2773
    },
    {
      "id": "8d4a6258-0534-4965-9400-09bb1f64a299",
      "url": "https://develop.opencast.org/static/mh_default_org/engage-player/ID-dual-stream-demo/b870e277-ba4b-4404-9e7d-b48f2f5b797f/dualstream-presentation.jpg",
      "mimetype": "image/jpeg",
      "flavor": "presentation/segment+preview",
      "tags": [
        "engage-download"
      ],
      "ref": "track:0278a658-fe0b-4aaa-9b95-7486eaee2201;time=T00:00:17:248F1000",
      "size": 1064
    },
    {
      "id": "63c69feb-f40f-4979-91ee-b7a5a5d9e609",
      "url": "https://develop.opencast.org/static/mh_default_org/engage-player/ID-dual-stream-demo/816740d5-4936-4f7a-9e41-5c7b34c9ed2e/dualstream-presentation.jpg",
      "mimetype": "image/jpeg",
      "flavor": "presentation/segment+preview",
      "tags": [
        "engage-download"
      ],
      "ref": "track:0278a658-fe0b-4aaa-9b95-7486eaee2201;time=T00:00:53:900F1000",
      "size": 2141
    },
    {
      "id": "060f10dc-8b6c-4ad4-b32e-6563b4875623",
      "url": "https://develop.opencast.org/static/mh_default_org/engage-player/ID-dual-stream-demo/0acfaaab-4f7e-49f6-b573-6e084a571437/dualstream-presentation.jpg",
      "mimetype": "image/jpeg",
      "flavor": "presentation/segment+preview",
      "tags": [
        "engage-download"
      ],
      "ref": "track:0278a658-fe0b-4aaa-9b95-7486eaee2201;time=T00:00:19:404F1000",
      "size": 2050
    },
    {
      "id": "7476bc75-95a9-4eef-9f36-00775e89522c",
      "url": "https://develop.opencast.org/static/mh_default_org/engage-player/ID-dual-stream-demo/0b356a55-99ab-4b7b-87f1-de244da5b040/dualstream-presentation_1.000s-player.jpg",
      "mimetype": "image/jpeg",
      "flavor": "presentation/player+preview",
      "tags": [
        "engage-download"
      ],
      "ref": "track:0278a658-fe0b-4aaa-9b95-7486eaee2201",
      "size": 26601
    },
    {
      "id": "b9957086-7779-4102-945c-acb7ab424bc2",
      "url": "https://develop.opencast.org/static/mh_default_org/engage-player/ID-dual-stream-demo/830ab156-5f0a-4d77-bd22-2601938339c5/dualstream-presenter_1.000s-player.jpg",
      "mimetype": "image/jpeg",
      "flavor": "presenter/player+preview",
      "tags": [
        "engage-download"
      ],
      "ref": "track:d47b65a2-5954-498f-abac-76b29f0772ed",
      "size": 34557
    },
    {
      "id": "049b4c53-56f8-41fb-b712-0cf92a003e1d",
      "url": "https://develop.opencast.org/static/mh_default_org/engage-player/ID-dual-stream-demo/015567ee-9d80-4c7e-9830-8014e028830d/dualstream-presentation.jpg",
      "mimetype": "image/jpeg",
      "flavor": "presentation/segment+preview",
      "tags": [
        "engage-download"
      ],
      "ref": "track:0278a658-fe0b-4aaa-9b95-7486eaee2201;time=T00:01:02:524F1000",
      "size": 2131
    },
    {
      "id": "9cf06454-6eaf-44bd-833a-9a435943d45b",
      "url": "https://develop.opencast.org/static/mh_default_org/engage-player/ID-dual-stream-demo/50134475-336b-4632-b353-c83acb6c8985/dualstream-presenter_1.000s-search.jpg",
      "mimetype": "image/jpeg",
      "flavor": "presenter/search+preview",
      "tags": [
        "engage-download"
      ],
      "ref": "track:d47b65a2-5954-498f-abac-76b29f0772ed",
      "size": 2815
    },
    {
      "id": "2ef3585e-4f09-4cc0-946e-5bbe710d7cc1",
      "url": "https://develop.opencast.org/static/mh_default_org/engage-player/ID-dual-stream-demo/47bc65b3-81fb-46ad-9442-f1652330b36c/dualstream-presentation.jpg",
      "mimetype": "image/jpeg",
      "flavor": "presentation/segment+preview",
      "tags": [
        "engage-download"
      ],
      "ref": "track:0278a658-fe0b-4aaa-9b95-7486eaee2201;time=T00:00:00:0F1000",
      "size": 2474
    },
    {
      "id": "f96a5d8f-f478-4eb0-a6e7-e718102044d9",
      "url": "https://develop.opencast.org/static/mh_default_org/engage-player/ID-dual-stream-demo/165d6500-0ae3-46a9-aedf-05f71fe623f6/dualstream-presentation.jpg",
      "mimetype": "image/jpeg",
      "flavor": "presentation/segment+preview",
      "tags": [
        "engage-download"
      ],
      "ref": "track:0278a658-fe0b-4aaa-9b95-7486eaee2201;time=T00:00:21:560F1000",
      "size": 2044
    }
  ],
  "catalogs": [
    {
      "id": "5b0f8d8a-7e72-4947-91bc-6618ccd9ac38",
      "url": "https://develop.opencast.org/static/mh_default_org/engage-player/ID-dual-stream-demo/0af81665-7c24-47b9-abef-318a410e93d3/dublincore.xml",
      "mimetype": "text/xml",
      "flavor": "dublincore/episode",
      "tags": [
        "archive"
      ],
      "checksum": {
        "type": "md5",
        "value": "3383779a03abfe2bcf4e46c703a977ec"
      }
    },
    {
      "id": "2e66df1d-b71a-42da-a151-970c0cff71d8",
      "url": "https://develop.opencast.org/static/mh_default_org/engage-player/ID-dual-stream-demo/2e5ace1f-48a3-4bf3-8309-b894670da885/dublincore.xml",
      "mimetype": "text/xml",
      "flavor": "dublincore/series",
      "tags": [
        "archive"
      ],
      "checksum": {
        "type": "md5",
        "value": "70ab7bc17ed5679dfbd5dc236b4546f3"
      }
    },
    {
      "id": "58d631ab-2089-421d-89dc-c10d12ab8c99",
      "url": "https://develop.opencast.org/static/mh_default_org/engage-player/ID-dual-stream-demo/bc356a7c-f366-4a68-b172-6633ac6cfe35/segments.xml",
      "mimetype": "text/xml",
      "flavor": "mpeg-7/segments",
      "tags": [
        "engage-download"
      ],
      "ref": "track:0278a658-fe0b-4aaa-9b95-7486eaee2201"
    }
  ]
}


