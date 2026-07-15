import React from 'react';
import { HelpCircle } from 'lucide-react';

export default function SizeGuideModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="size-guide-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>OH POLLY SIZE GUIDE</h3>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <table className="size-guide-table">
            <thead>
              <tr>
                <th>SIZE</th>
                <th>BUST (INCHES)</th>
                <th>WAIST (INCHES)</th>
                <th>HIPS (INCHES)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>XXS (US 0)</td>
                <td>30 - 31</td>
                <td>22 - 23</td>
                <td>32 - 33</td>
              </tr>
              <tr>
                <td>XS (US 2)</td>
                <td>32 - 33</td>
                <td>24 - 25</td>
                <td>34 - 35</td>
              </tr>
              <tr>
                <td>S (US 4)</td>
                <td>34 - 35</td>
                <td>26 - 27</td>
                <td>36 - 37</td>
              </tr>
              <tr>
                <td>M (US 6)</td>
                <td>36 - 37</td>
                <td>28 - 29</td>
                <td>38 - 39</td>
              </tr>
              <tr>
                <td>L (US 8)</td>
                <td>38 - 40</td>
                <td>30 - 32</td>
                <td>40 - 42</td>
              </tr>
              <tr>
                <td>XL (US 10)</td>
                <td>41 - 43</td>
                <td>33 - 35</td>
                <td>43 - 45</td>
              </tr>
            </tbody>
          </table>
          <div className="modal-help-tip">
            <HelpCircle size={14} />
            <span>Sizes fit snug. If between sizes, we recommend ordering a size up.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
