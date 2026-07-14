import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function ProductAccordions({ product, activeAccordion, toggleAccordion }) {
  return (
    <div className="detail-accordions">
      
      {/* Accordion Item: Description */}
      <div className="accordion-item">
        <button className="accordion-header" onClick={() => toggleAccordion('description')}>
          <span>DESCRIPTION</span>
          {activeAccordion === 'description' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {activeAccordion === 'description' && (
          <div className="accordion-body">
            <p>{product.description}</p>
          </div>
        )}
      </div>

      {/* Accordion Item: Fit & Fabric */}
      <div className="accordion-item">
        <button className="accordion-header" onClick={() => toggleAccordion('fabric')}>
          <span>FABRIC & FIT DETAILS</span>
          {activeAccordion === 'fabric' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {activeAccordion === 'fabric' && (
          <div className="accordion-body">
            <ul className="accordion-list">
              {product.details.map((detail, idx) => (
                <li key={idx}>{detail}</li>
              ))}
              <li>True to size fit. Designed to snatch curves.</li>
              <li>Model is 5'7" and wearing size S.</li>
            </ul>
          </div>
        )}
      </div>

      {/* Accordion Item: Delivery & Returns */}
      <div className="accordion-item">
        <button className="accordion-header" onClick={() => toggleAccordion('shipping')}>
          <span>DELIVERY & RETURNS</span>
          {activeAccordion === 'shipping' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {activeAccordion === 'shipping' && (
          <div className="accordion-body">
            <p><strong>Next Day Delivery:</strong> Order before 8pm for UK Next Day Delivery.</p>
            <p><strong>International Shipping:</strong> Express worldwide shipping available. Delivery in 3-5 business days.</p>
            <p><strong>Returns:</strong> Return unused items in original packaging within 14 days of purchase. Sale items are store credit only.</p>
          </div>
        )}
      </div>

    </div>
  );
}
