# WrenchLogic — ERD (Entity Relationship Diagram)

תרשים מסד הנתונים (Supabase / PostgreSQL). ניתן לצפייה ב-GitHub, ב-VS Code (עם תוסף Mermaid), או בכל מציג Markdown שתומך ב-Mermaid.

```mermaid
erDiagram
    profiles   ||--o{ vehicles       : "owns"
    profiles   ||--o{ garage_entries : "owns"
    vehicles   |o--o{ garage_entries : "scopes (nullable)"
    categories ||--o{ parts          : "groups"
    parts      ||--o{ garage_entries : "referenced by"

    profiles {
        uuid        id         PK
        text        email
        timestamptz created_at
    }

    vehicles {
        uuid        id                PK
        uuid        user_id           FK
        text        manufacturer_name
        text        model_name
        int         year
        text        engine_code
        int         base_hp
        int         base_torque_nm
        int         base_weight_kg
        timestamptz created_at
    }

    categories {
        uuid id      PK
        text slug
        text name
        text name_en
    }

    parts {
        text    id             PK
        text    name
        text    name_en
        text    description
        text    description_en
        uuid    category_id    FK
        int     hp_gain
        int     torque_gain_nm
        text    difficulty
        bool    is_legal
        text    image_url
        int     price_ils
        numeric weight_change_kg
    }

    garage_entries {
        uuid        id         PK
        uuid        user_id    FK
        text        part_id    FK
        uuid        vehicle_id FK "nullable"
        text        status
        timestamptz created_at
        timestamptz updated_at
    }

    feedback {
        uuid        id         PK
        text        message
        int         rating
        text        page_url
        timestamptz created_at
    }
```

## הקשרים (Relationships)

| מ- | אל | סוג | הערה |
|----|-----|-----|------|
| `profiles` | `vehicles` | 1 — * | למשתמש יש מספר רכבים שמורים |
| `profiles` | `garage_entries` | 1 — * | למשתמש יש מספר חלפים בגראז' |
| `vehicles` | `garage_entries` | 1 — * | כל ערך גראז' משויך לרכב (אופציונלי — `vehicle_id` nullable; אורח = NULL) |
| `categories` | `parts` | 1 — * | כל קטגוריה מכילה מספר חלפים |
| `parts` | `garage_entries` | 1 — * | כל ערך גראז' מצביע על חלף |

## הערות

- `feedback` היא טבלה עצמאית (ללא מפתחות זרים) — מאחסנת משוב משתמשים, כולל אנונימי.
- `parts.id` הוא **TEXT** (מזהים כמו `wl-tur-001`), בעוד שאר המפתחות הראשיים הם **UUID**.
- `garage_entries.vehicle_id` הוא **nullable** כדי לאפשר גראז' לאורחים (ללא רכב שמור ב-DB).
- עמודות `name_en` / `description_en` תומכות בתצוגה דו-לשונית (עברית/אנגלית).
