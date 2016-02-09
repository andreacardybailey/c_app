var zoneinfo = require('zoneinfo');

exports.optionList = function(model, value, text, options, next) {

   var defaults = { sort: null, where : null, selected : null };
   var options = _.extend(defaults, options);
   var ops = '';
   var scope = model.find();
   
   if(options.where)
   {
      scope.where(options.where);
   }
   
   if(options.sort)
   {
      scope.sort(options.sort);
   }

   scope.exec(function(err, results){
   
      if(results) {
         results.forEach(function(result){
         
            var display = [];
         
            if(_.isArray(text)){
              text.forEach(function(col){
                display.push(result[col]);
              });
            } else {
              display.push(result[text]);
            }
         
            ops += '<option value="'+result[value]+'"';
            ops += String(options.selected) == String(result[value]) ? ' selected="selected"' : '';
            ops += '>'+ display.join(' / ') + '</option>';
         });
      }
      
      next(ops);
   });
}

exports.radioList = function(model, name, value, text, options, next) {

   var defaults = { sort: null, where : null, selected : null };
   var options = _.extend(defaults, options);
   var ops = '';
   var scope = model.find();
   
   if(options.where)
   {
      scope.where(options.where);
   }
   
   if(options.sort)
   {
      scope.sort(options.sort);
   }

   scope.exec(function(err, results){
   
      if(results) {
         results.forEach(function(result, count){
            ops += '<input type="radio" name="'+name+'" id="'+name+'_'+count+'" value="'+result[value]+'"';
            ops += String(options.selected) == String(result[value]) ? ' checked="checked"' : '';
            ops += '><label for="'+name+'_'+count+'">'+result[text]+'</label>';
         });
      }
      
      next(ops);
   });
}

exports.formName = function(model){
   return 'randForm' + String(new Date().getTime()).substr(0,7);
}

exports.tableHeaderSortable = function(id, label, dir, params)
{
   var dir  = dir || 'desc';
   
   switch(dir)
   {
      case 'desc':
         dir = 'asc';
      break;
      
      case 'asc':
      default:
         dir = 'desc';      
      break;   
   }
   
   var query = [];
   
    if(params){
      for(var key in params){
        if(key != 'dir' && key != 'sort') {
          
          if(_.isArray(params[key])) {
            
            params[key].forEach(function(val){
              query.push(encodeURIComponent(key + '[]') + '=' + encodeURIComponent(val));
            });
            
          } else {    
          
            query.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
          }
        }
      }
    }
   
   query.push('sort='+id);
   query.push('dir='+dir);

   return '<a href="?'+query.join('&')+'">'+label+'</a>';

}


exports.countryList = function(){
  return [ 
    {name: 'Afghanistan', code: 'AF'}, 
    {name: 'Åland Islands', code: 'AX'}, 
    {name: 'Albania', code: 'AL'}, 
    {name: 'Algeria', code: 'DZ'}, 
    {name: 'American Samoa', code: 'AS'}, 
    {name: 'AndorrA', code: 'AD'}, 
    {name: 'Angola', code: 'AO'}, 
    {name: 'Anguilla', code: 'AI'}, 
    {name: 'Antarctica', code: 'AQ'}, 
    {name: 'Antigua and Barbuda', code: 'AG'}, 
    {name: 'Argentina', code: 'AR'}, 
    {name: 'Armenia', code: 'AM'}, 
    {name: 'Aruba', code: 'AW'}, 
    {name: 'Australia', code: 'AU'}, 
    {name: 'Austria', code: 'AT'}, 
    {name: 'Azerbaijan', code: 'AZ'}, 
    {name: 'Bahamas', code: 'BS'}, 
    {name: 'Bahrain', code: 'BH'}, 
    {name: 'Bangladesh', code: 'BD'}, 
    {name: 'Barbados', code: 'BB'}, 
    {name: 'Belarus', code: 'BY'}, 
    {name: 'Belgium', code: 'BE'}, 
    {name: 'Belize', code: 'BZ'}, 
    {name: 'Benin', code: 'BJ'}, 
    {name: 'Bermuda', code: 'BM'}, 
    {name: 'Bhutan', code: 'BT'}, 
    {name: 'Bolivia', code: 'BO'}, 
    {name: 'Bosnia and Herzegovina', code: 'BA'}, 
    {name: 'Botswana', code: 'BW'}, 
    {name: 'Bouvet Island', code: 'BV'}, 
    {name: 'Brazil', code: 'BR'}, 
    {name: 'British Indian Ocean Territory', code: 'IO'}, 
    {name: 'Brunei Darussalam', code: 'BN'}, 
    {name: 'Bulgaria', code: 'BG'}, 
    {name: 'Burkina Faso', code: 'BF'}, 
    {name: 'Burundi', code: 'BI'}, 
    {name: 'Cambodia', code: 'KH'}, 
    {name: 'Cameroon', code: 'CM'}, 
    {name: 'Canada', code: 'CA'}, 
    {name: 'Cape Verde', code: 'CV'}, 
    {name: 'Cayman Islands', code: 'KY'}, 
    {name: 'Central African Republic', code: 'CF'}, 
    {name: 'Chad', code: 'TD'}, 
    {name: 'Chile', code: 'CL'}, 
    {name: 'China', code: 'CN'}, 
    {name: 'Christmas Island', code: 'CX'}, 
    {name: 'Cocos (Keeling) Islands', code: 'CC'}, 
    {name: 'Colombia', code: 'CO'}, 
    {name: 'Comoros', code: 'KM'}, 
    {name: 'Congo', code: 'CG'}, 
    {name: 'Congo, The Democratic Republic of the', code: 'CD'}, 
    {name: 'Cook Islands', code: 'CK'}, 
    {name: 'Costa Rica', code: 'CR'}, 
    {name: 'Cote D\'Ivoire', code: 'CI'}, 
    {name: 'Croatia', code: 'HR'}, 
    {name: 'Cuba', code: 'CU'}, 
    {name: 'Cyprus', code: 'CY'}, 
    {name: 'Czech Republic', code: 'CZ'}, 
    {name: 'Denmark', code: 'DK'}, 
    {name: 'Djibouti', code: 'DJ'}, 
    {name: 'Dominica', code: 'DM'}, 
    {name: 'Dominican Republic', code: 'DO'}, 
    {name: 'Ecuador', code: 'EC'}, 
    {name: 'Egypt', code: 'EG'}, 
    {name: 'El Salvador', code: 'SV'}, 
    {name: 'Equatorial Guinea', code: 'GQ'}, 
    {name: 'Eritrea', code: 'ER'}, 
    {name: 'Estonia', code: 'EE'}, 
    {name: 'Ethiopia', code: 'ET'}, 
    {name: 'Falkland Islands (Malvinas)', code: 'FK'}, 
    {name: 'Faroe Islands', code: 'FO'}, 
    {name: 'Fiji', code: 'FJ'}, 
    {name: 'Finland', code: 'FI'}, 
    {name: 'France', code: 'FR'}, 
    {name: 'French Guiana', code: 'GF'}, 
    {name: 'French Polynesia', code: 'PF'}, 
    {name: 'French Southern Territories', code: 'TF'}, 
    {name: 'Gabon', code: 'GA'}, 
    {name: 'Gambia', code: 'GM'}, 
    {name: 'Georgia', code: 'GE'}, 
    {name: 'Germany', code: 'DE'}, 
    {name: 'Ghana', code: 'GH'}, 
    {name: 'Gibraltar', code: 'GI'}, 
    {name: 'Greece', code: 'GR'}, 
    {name: 'Greenland', code: 'GL'}, 
    {name: 'Grenada', code: 'GD'}, 
    {name: 'Guadeloupe', code: 'GP'}, 
    {name: 'Guam', code: 'GU'}, 
    {name: 'Guatemala', code: 'GT'}, 
    {name: 'Guernsey', code: 'GG'}, 
    {name: 'Guinea', code: 'GN'}, 
    {name: 'Guinea-Bissau', code: 'GW'}, 
    {name: 'Guyana', code: 'GY'}, 
    {name: 'Haiti', code: 'HT'}, 
    {name: 'Heard Island and Mcdonald Islands', code: 'HM'}, 
    {name: 'Holy See (Vatican City State)', code: 'VA'}, 
    {name: 'Honduras', code: 'HN'}, 
    {name: 'Hong Kong', code: 'HK'}, 
    {name: 'Hungary', code: 'HU'}, 
    {name: 'Iceland', code: 'IS'}, 
    {name: 'India', code: 'IN'}, 
    {name: 'Indonesia', code: 'ID'}, 
    {name: 'Iran, Islamic Republic Of', code: 'IR'}, 
    {name: 'Iraq', code: 'IQ'}, 
    {name: 'Ireland', code: 'IE'}, 
    {name: 'Isle of Man', code: 'IM'}, 
    {name: 'Israel', code: 'IL'}, 
    {name: 'Italy', code: 'IT'}, 
    {name: 'Jamaica', code: 'JM'}, 
    {name: 'Japan', code: 'JP'}, 
    {name: 'Jersey', code: 'JE'}, 
    {name: 'Jordan', code: 'JO'}, 
    {name: 'Kazakhstan', code: 'KZ'}, 
    {name: 'Kenya', code: 'KE'}, 
    {name: 'Kiribati', code: 'KI'}, 
    {name: 'Korea, Democratic People\'S Republic of', code: 'KP'}, 
    {name: 'Korea, Republic of', code: 'KR'}, 
    {name: 'Kuwait', code: 'KW'}, 
    {name: 'Kyrgyzstan', code: 'KG'}, 
    {name: 'Lao People\'S Democratic Republic', code: 'LA'}, 
    {name: 'Latvia', code: 'LV'}, 
    {name: 'Lebanon', code: 'LB'}, 
    {name: 'Lesotho', code: 'LS'}, 
    {name: 'Liberia', code: 'LR'}, 
    {name: 'Libyan Arab Jamahiriya', code: 'LY'}, 
    {name: 'Liechtenstein', code: 'LI'}, 
    {name: 'Lithuania', code: 'LT'}, 
    {name: 'Luxembourg', code: 'LU'}, 
    {name: 'Macao', code: 'MO'}, 
    {name: 'Macedonia, The Former Yugoslav Republic of', code: 'MK'}, 
    {name: 'Madagascar', code: 'MG'}, 
    {name: 'Malawi', code: 'MW'}, 
    {name: 'Malaysia', code: 'MY'}, 
    {name: 'Maldives', code: 'MV'}, 
    {name: 'Mali', code: 'ML'}, 
    {name: 'Malta', code: 'MT'}, 
    {name: 'Marshall Islands', code: 'MH'}, 
    {name: 'Martinique', code: 'MQ'}, 
    {name: 'Mauritania', code: 'MR'}, 
    {name: 'Mauritius', code: 'MU'}, 
    {name: 'Mayotte', code: 'YT'}, 
    {name: 'Mexico', code: 'MX'}, 
    {name: 'Micronesia, Federated States of', code: 'FM'}, 
    {name: 'Moldova, Republic of', code: 'MD'}, 
    {name: 'Monaco', code: 'MC'}, 
    {name: 'Mongolia', code: 'MN'}, 
    {name: 'Montserrat', code: 'MS'}, 
    {name: 'Morocco', code: 'MA'}, 
    {name: 'Mozambique', code: 'MZ'}, 
    {name: 'Myanmar', code: 'MM'}, 
    {name: 'Namibia', code: 'NA'}, 
    {name: 'Nauru', code: 'NR'}, 
    {name: 'Nepal', code: 'NP'}, 
    {name: 'Netherlands', code: 'NL'}, 
    {name: 'Netherlands Antilles', code: 'AN'}, 
    {name: 'New Caledonia', code: 'NC'}, 
    {name: 'New Zealand', code: 'NZ'}, 
    {name: 'Nicaragua', code: 'NI'}, 
    {name: 'Niger', code: 'NE'}, 
    {name: 'Nigeria', code: 'NG'}, 
    {name: 'Niue', code: 'NU'}, 
    {name: 'Norfolk Island', code: 'NF'}, 
    {name: 'Northern Mariana Islands', code: 'MP'}, 
    {name: 'Norway', code: 'NO'}, 
    {name: 'Oman', code: 'OM'}, 
    {name: 'Pakistan', code: 'PK'}, 
    {name: 'Palau', code: 'PW'}, 
    {name: 'Palestinian Territory, Occupied', code: 'PS'}, 
    {name: 'Panama', code: 'PA'}, 
    {name: 'Papua New Guinea', code: 'PG'}, 
    {name: 'Paraguay', code: 'PY'}, 
    {name: 'Peru', code: 'PE'}, 
    {name: 'Philippines', code: 'PH'}, 
    {name: 'Pitcairn', code: 'PN'}, 
    {name: 'Poland', code: 'PL'}, 
    {name: 'Portugal', code: 'PT'}, 
    {name: 'Puerto Rico', code: 'PR'}, 
    {name: 'Qatar', code: 'QA'}, 
    {name: 'Reunion', code: 'RE'}, 
    {name: 'Romania', code: 'RO'}, 
    {name: 'Russian Federation', code: 'RU'}, 
    {name: 'RWANDA', code: 'RW'}, 
    {name: 'Saint Helena', code: 'SH'}, 
    {name: 'Saint Kitts and Nevis', code: 'KN'}, 
    {name: 'Saint Lucia', code: 'LC'}, 
    {name: 'Saint Pierre and Miquelon', code: 'PM'}, 
    {name: 'Saint Vincent and the Grenadines', code: 'VC'}, 
    {name: 'Samoa', code: 'WS'}, 
    {name: 'San Marino', code: 'SM'}, 
    {name: 'Sao Tome and Principe', code: 'ST'}, 
    {name: 'Saudi Arabia', code: 'SA'}, 
    {name: 'Senegal', code: 'SN'}, 
    {name: 'Serbia and Montenegro', code: 'CS'}, 
    {name: 'Seychelles', code: 'SC'}, 
    {name: 'Sierra Leone', code: 'SL'}, 
    {name: 'Singapore', code: 'SG'}, 
    {name: 'Slovakia', code: 'SK'}, 
    {name: 'Slovenia', code: 'SI'}, 
    {name: 'Solomon Islands', code: 'SB'}, 
    {name: 'Somalia', code: 'SO'}, 
    {name: 'South Africa', code: 'ZA'}, 
    {name: 'South Georgia and the South Sandwich Islands', code: 'GS'}, 
    {name: 'Spain', code: 'ES'}, 
    {name: 'Sri Lanka', code: 'LK'}, 
    {name: 'Sudan', code: 'SD'}, 
    {name: 'Suriname', code: 'SR'}, 
    {name: 'Svalbard and Jan Mayen', code: 'SJ'}, 
    {name: 'Swaziland', code: 'SZ'}, 
    {name: 'Sweden', code: 'SE'}, 
    {name: 'Switzerland', code: 'CH'}, 
    {name: 'Syrian Arab Republic', code: 'SY'}, 
    {name: 'Taiwan, Province of China', code: 'TW'}, 
    {name: 'Tajikistan', code: 'TJ'}, 
    {name: 'Tanzania, United Republic of', code: 'TZ'}, 
    {name: 'Thailand', code: 'TH'}, 
    {name: 'Timor-Leste', code: 'TL'}, 
    {name: 'Togo', code: 'TG'}, 
    {name: 'Tokelau', code: 'TK'}, 
    {name: 'Tonga', code: 'TO'}, 
    {name: 'Trinidad and Tobago', code: 'TT'}, 
    {name: 'Tunisia', code: 'TN'}, 
    {name: 'Turkey', code: 'TR'}, 
    {name: 'Turkmenistan', code: 'TM'}, 
    {name: 'Turks and Caicos Islands', code: 'TC'}, 
    {name: 'Tuvalu', code: 'TV'}, 
    {name: 'Uganda', code: 'UG'}, 
    {name: 'Ukraine', code: 'UA'}, 
    {name: 'United Arab Emirates', code: 'AE'}, 
    {name: 'United Kingdom', code: 'GB'}, 
    {name: 'United States', code: 'US'}, 
    {name: 'United States Minor Outlying Islands', code: 'UM'}, 
    {name: 'Uruguay', code: 'UY'}, 
    {name: 'Uzbekistan', code: 'UZ'}, 
    {name: 'Vanuatu', code: 'VU'}, 
    {name: 'Venezuela', code: 'VE'}, 
    {name: 'Viet Nam', code: 'VN'}, 
    {name: 'Virgin Islands, British', code: 'VG'}, 
    {name: 'Virgin Islands, U.S.', code: 'VI'}, 
    {name: 'Wallis and Futuna', code: 'WF'}, 
    {name: 'Western Sahara', code: 'EH'}, 
    {name: 'Yemen', code: 'YE'}, 
    {name: 'Zambia', code: 'ZM'}, 
    {name: 'Zimbabwe', code: 'ZW'} 
  ];
}

exports.stateList = function()
{
   return   {
       "AL": "Alabama",
       "AK": "Alaska",
       "AS": "American Samoa",
       "AZ": "Arizona",
       "AR": "Arkansas",
       "CA": "California",
       "CO": "Colorado",
       "CT": "Connecticut",
       "DE": "Delaware",
       "DC": "District Of Columbia",
       "FM": "Federated States Of Micronesia",
       "FL": "Florida",
       "GA": "Georgia",
       "GU": "Guam",
       "HI": "Hawaii",
       "ID": "Idaho",
       "IL": "Illinois",
       "IN": "Indiana",
       "IA": "Iowa",
       "KS": "Kansas",
       "KY": "Kentucky",
       "LA": "Louisiana",
       "ME": "Maine",
       "MH": "Marshall Islands",
       "MD": "Maryland",
       "MA": "Massachusetts",
       "MI": "Michigan",
       "MN": "Minnesota",
       "MS": "Mississippi",
       "MO": "Missouri",
       "MT": "Montana",
       "NE": "Nebraska",
       "NV": "Nevada",
       "NH": "New Hampshire",
       "NJ": "New Jersey",
       "NM": "New Mexico",
       "NY": "New York",
       "NC": "North Carolina",
       "ND": "North Dakota",
       "MP": "Northern Mariana Islands",
       "OH": "Ohio",
       "OK": "Oklahoma",
       "OR": "Oregon",
       "PW": "Palau",
       "PA": "Pennsylvania",
       "PR": "Puerto Rico",
       "RI": "Rhode Island",
       "SC": "South Carolina",
       "SD": "South Dakota",
       "TN": "Tennessee",
       "TX": "Texas",
       "UT": "Utah",
       "VT": "Vermont",
       "VI": "Virgin Islands",
       "VA": "Virginia",
       "WA": "Washington",
       "WV": "West Virginia",
       "WI": "Wisconsin",
       "WY": "Wyoming"
   };
}

exports.ucfirst = function(str)
{
	return str.charAt(0).toUpperCase() + str.toLowerCase().slice(1);
}

exports.timezoneList = function(country)
{
   return zoneinfo.listTimezones(country);
}

exports.schemaElement = function(collection, key, element, manage)
{
   var items = element.choices ? element.choices : [];
   var tmpl = '<tr data-id="'+collection+'_'+key+'" data-type="'+element.type+'" data-collection="'+collection+'" data-key="'+key+'"><td><label>{label}</label></td><td>{input}</td>';
   
   if(manage)
   {
      tmpl += '<td><a href="#update" class="editElement">✎</a><a href="#moveUp" class="move">▲</a><a href="#moveDown" class="move">▼</a> <a href="#delete" class="remove">✖</a></td>';
   }
   
   tmpl += '</tr>';
   
   var content = '';
   var tagid = (collection+'_'+key);
   
   // system variable - only process if not editing
   if(!manage && element.defaultsTo !== null && String(element.defaultsTo).match(/^eval:/))
   {
      try{
         element.defaultsTo = eval('(sails.'+element.defaultsTo.replace(/^eval:/,'')+')');
      } catch(e) {
         element.defaultsTo = '';
      }
   }
   
   switch(element.type)
   {
      case 'image':
         input  = '<input id="_'+tagid+'" name="_'+tagid+'" type="file" />';
         input += '<input type="hidden" name="'+tagid+'" id="'+tagid+'" value="'+(element.defaultsTo ? element.defaultsTo : '')+'" />';
         input += '<img src="'+(element.defaultsTo ? '//s3-us-west-2.amazonaws.com/img.cannatest.com/' + element.defaultsTo : '')+'" style="'+(element.defaultsTo ? 'display:block' : 'display:none')+';max-width:200px"/>';
      break;

      case 'string':
         input = '<input id="'+tagid+'" name="'+tagid+'" type="text" '+(manage  ? 'readonly="readonly"' : '')+' value="'+ (element.defaultsTo ? element.defaultsTo : '')+'" />';
      break;
      
      case 'number':
         input = '<input id="'+tagid+'" name="'+tagid+'" type="number" '+(manage  ? 'readonly="readonly"' : '')+' value="'+(element.defaultsTo ? String(element.defaultsTo) : '')+'" />';
      break;
      
      case 'float':
         input = '<input id="'+tagid+'" name="'+tagid+'" type="number" step=".01" '+(manage  ? 'readonly="readonly"' : '')+' value="'+(element.defaultsTo ? String(element.defaultsTo) : '')+'" />';
      break;
      
      case 'date':
         input = '<input id="'+tagid+'" name="'+tagid+'" type="date" '+(manage  ? 'readonly="readonly"' : '')+' value="'+(element.defaultsTo ? element.defaultsTo : '')+'" />';
      break;
      
      case 'text':
         input = '<textarea id="'+tagid+'"  name="'+tagid+'" rows="4">'+(element.defaultsTo ? element.defaultsTo : '')+'</textarea>';
      break;     
      
      case 'boolean' : 
         var isTrue = element.defaultsTo && String(element.defaultsTo).match(/^(1|true|yes|on|enabled)$/i);
         input = '<div class="radio"><input id="'+(collection+'_'+key+'_true')+'" name="'+tagid+'" type="radio"'+(isTrue ? ' checked="checked"' : '')+'/> <label for="'+(collection+'_'+key+'_true')+'">Yes</label><input id="'+(collection+'_'+key+'_false')+'" name="'+tagid+'" type="radio"'+(!isTrue ? ' checked="checked"' : '')+'/> <label for="'+(collection+'_'+key+'_false')+'">No</label></div>';
      break;
      
      case 'listmulti' :
      
         if(items.length <= 3) 
         {
            input ='<div class="checkbox"><ul>';
            
            for(var i=0; i < items.length;i++) 
            {
               input += '<li><input id="'+(collection+'_'+key+'_'+i)+'" name="'+tagid+'[]" value="'+(items[i])+'" type="checkbox" value="'+items[i]+'"/> <label for="'+(collection+'_'+key+'_'+i)+'">'+items[i]+'</label></li>';
            }
            input +=' </ul></div>';
         }
         else 
         {
            input = '<select id="'+tagid+'" name="'+tagid+'[]" multiple="multiple" data-placeholder="'+'➥ Select '+element.label.toLowerCase()+'">';
         
            for(var i=0; i < items.length;i++) 
            {
               input += '<option>'+items[i]+'</option>';
            }                  
            input += '</select>';               
         }
      
      break;
      
      case 'listsingle' :
      
         if(items.length <= 3) 
         {
            input = '<div class="radio">';
            
            for(var i=0; i < items.length;i++) 
            {
               input += '<input id="'+(collection+'_'+key+'_'+i)+'" name="'+tagid+'" type="radio"'+(element.defaultsTo && items[i] == element.defaultsTo ? ' checked="checked"' : '')+' value="'+items[i]+'"/> <label for="'+(collection+'_'+key+'_'+i)+'">'+items[i]+'</label>';
            }
            input += '</div>';
         }
         else 
         {
            input = '<select id="'+tagid+'" name="'+tagid+'"data-placeholder="'+'➥ Select '+element.label.toLowerCase()+'">';
         
            for(var i=0; i < items.length;i++) 
            {
               input += '<option'+(element.defaultsTo && items[i] == element.defaultsTo ? ' selected="selected"' : '')+'>'+items[i]+'</option>';
            }                  
            input += '</select>';               
         }
      
      break;
      
      default:
         input = '<input id="'+tagid+'" name="'+tagid+'"type="text" '+(manage  ? 'readonly="readonly"' : '')+' value="'+(element.defaultsTo ? element.defaultsTo : '')+'" />';
      break;
   }        
   
   if(element.unit != '') {
      input += ' <small>('+element.unit+')</small>';
   }
   
   // replace content into template
   tr = tmpl.replace(/\{label\}/, element.label);
   tr = tr.replace(/\{input\}/, input); 
     
   return tr;

}

