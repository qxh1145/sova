import type { Pricing, PricingCell, SectionCopy } from '@/types/content';

export type TablePricing = Extract<Pricing, { kind: 'table' }>;

export interface PricingTableIds {
  section: string;
  /** Gap above the heading. */
  topGap?: string;
  /** Classes on topGap element; defaults to `gap-element clearfix hide-for-small`. */
  topGapClass?: string;
  headingRow: string;
  headingCol: string;
  eyebrowText: string;
  titleText: string;
  tableRow: string;
  tableCol: string;
  /** Optional id for .vps-table-wrapper (e.g. `vps-email-dn-1`). */
  wrapperId?: string;
}

export const PRICING_TABLE_IDS_HOSTING_VI: PricingTableIds = {
  section: 'section_1575376699',
  topGap: 'gap-72982326',
  headingRow: 'row-1123055074',
  headingCol: 'col-1831270013',
  eyebrowText: 'text-3280579848',
  titleText: 'text-4082613514',
  tableRow: 'row-1397994714',
  tableCol: 'col-1916611114',
};

export const PRICING_TABLE_IDS_HOSTING_EN: PricingTableIds = {
  section: 'section_594539523',
  topGap: 'gap-1925699266',
  headingRow: 'row-1317658109',
  headingCol: 'col-1916933074',
  eyebrowText: 'text-3407063857',
  titleText: 'text-1519061246',
  tableRow: 'row-188418058',
  tableCol: 'col-284352927',
};

export const PRICING_TABLE_IDS_VPS_VI: PricingTableIds = {
  section: 'section_887597801',
  topGap: 'gap-726877265',
  headingRow: 'row-439574110',
  headingCol: 'col-692704092',
  eyebrowText: 'text-4241724311',
  titleText: 'text-3790309195',
  tableRow: 'row-221557716',
  tableCol: 'col-1988058319',
};

export const PRICING_TABLE_IDS_VPS_EN: PricingTableIds = {
  section: 'section_932558823',
  topGap: 'gap-511311481',
  headingRow: 'row-877480386',
  headingCol: 'col-981321463',
  eyebrowText: 'text-2952785218',
  titleText: 'text-3790584998',
  tableRow: 'row-752978616',
  tableCol: 'col-29190709',
};

export const PRICING_TABLE_IDS_EMAIL_VI: PricingTableIds = {
  section: 'section_1723121385',
  topGap: 'gap-1496315896',
  topGapClass: 'gap-element clearfix',
  headingRow: 'row-1343462591',
  headingCol: 'col-1699782743',
  eyebrowText: 'text-2801814563',
  titleText: 'text-175338096',
  tableRow: 'row-1107519995',
  tableCol: 'col-1897353336',
  wrapperId: 'vps-email-dn-1',
};

export const PRICING_TABLE_IDS_EMAIL_EN: PricingTableIds = {
  section: 'section_1607043033',
  topGap: 'gap-490160498',
  topGapClass: 'gap-element clearfix',
  headingRow: 'row-1619090874',
  headingCol: 'col-1079132485',
  eyebrowText: 'text-1957191661',
  titleText: 'text-486854854',
  tableRow: 'row-298469797',
  tableCol: 'col-947553831',
  wrapperId: 'vps-email-dn-1',
};


export interface PricingTableProps {
  pricing: TablePricing;
  copy?: SectionCopy;
  ids: PricingTableIds;
}

function cellContent(cell: PricingCell | undefined) {
  if (!cell) return null;
  if (cell.kind === 'money') return cell.value.displayText;
  if (cell.kind === 'included') return cell.value ? '✓' : '✕';
  return cell.value;
}

/**
 * Source `div.vps-table-wrapper > table.vps-table` pricing section (Email/Hosting/VPS). The first
 * column is the bold plan name; the last column is the row plan's CTA. On narrow screens the
 * wrapper scrolls horizontally (legacy `.vps-table-wrapper` CSS), never the page.
 */
export function PricingTable({ pricing, copy, ids }: PricingTableProps) {
  const lastIndex = pricing.columns.length - 1;

  return (
    <section className="section" id={ids.section}>
      <div className="section-bg fill" />
      <div className="section-content relative">
        {ids.topGap && (
          <div
            id={ids.topGap}
            className={ids.topGapClass ?? 'gap-element clearfix hide-for-small'}
            style={{ display: 'block', height: 'auto' }}
          />
        )}
        <div className="row" id={ids.headingRow}>
          <div id={ids.headingCol} className="col small-12 large-12">
            <div className="col-inner text-left">
              {copy?.eyebrow && (
                <div id={ids.eyebrowText} className="text">
                  <p>
                    <strong>{copy.eyebrow}</strong>
                    <br />
                  </p>
                </div>
              )}
              <div id={ids.titleText} className="text">
                <h2 style={{ textAlign: 'left' }}>{copy?.title ?? pricing.heading}</h2>
              </div>
              <div className="text-center">
                <div
                  className="is-divider divider clearfix"
                  style={{ maxWidth: 133, height: 2, backgroundColor: 'rgb(0, 101, 223)' }}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="row" id={ids.tableRow}>
          <div id={ids.tableCol} className="col small-12 large-12">
            <div className="col-inner">
              <div className="vps-table-wrapper" id={ids.wrapperId}>
                <table className="vps-table">
                  <thead>
                    <tr>
                      {pricing.columns.map((column) => (
                        <th key={column.id}>{column.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pricing.rows.map((row) => {
                      const plan = pricing.plans.find((p) => p.id === row.id);
                      return (
                        <tr key={row.id}>
                          {pricing.columns.map((column, index) => {
                            const cell = row.cells[column.id];
                            if (index === lastIndex && plan) {
                              return (
                                <td key={column.id}>
                                  <a
                                    className="vps-btn"
                                    href={plan.cta.href}
                                    target={plan.cta.external ? '_blank' : undefined}
                                    rel={plan.cta.external ? 'noopener' : undefined}
                                  >
                                    <span>{plan.cta.label}</span>
                                  </a>
                                </td>
                              );
                            }
                            return (
                              <td
                                key={column.id}
                                className={cell?.kind === 'money' ? 'vps-price' : undefined}
                              >
                                {index === 0 ? (
                                  <strong>{cellContent(cell)}</strong>
                                ) : (
                                  cellContent(cell)
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
