(window["web3Ready_jsonp"] = window["web3Ready_jsonp"] || []).push([[9],{

/***/ "07f4":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

var utils = __webpack_require__("be7f");

/* Public constants ==========================================================*/
/* ===========================================================================*/


//var Z_FILTERED          = 1;
//var Z_HUFFMAN_ONLY      = 2;
//var Z_RLE               = 3;
var Z_FIXED               = 4;
//var Z_DEFAULT_STRATEGY  = 0;

/* Possible values of the data_type field (though see inflate()) */
var Z_BINARY              = 0;
var Z_TEXT                = 1;
//var Z_ASCII             = 1; // = Z_TEXT
var Z_UNKNOWN             = 2;

/*============================================================================*/


function zero(buf) { var len = buf.length; while (--len >= 0) { buf[len] = 0; } }

// From zutil.h

var STORED_BLOCK = 0;
var STATIC_TREES = 1;
var DYN_TREES    = 2;
/* The three kinds of block type */

var MIN_MATCH    = 3;
var MAX_MATCH    = 258;
/* The minimum and maximum match lengths */

// From deflate.h
/* ===========================================================================
 * Internal compression state.
 */

var LENGTH_CODES  = 29;
/* number of length codes, not counting the special END_BLOCK code */

var LITERALS      = 256;
/* number of literal bytes 0..255 */

var L_CODES       = LITERALS + 1 + LENGTH_CODES;
/* number of Literal or Length codes, including the END_BLOCK code */

var D_CODES       = 30;
/* number of distance codes */

var BL_CODES      = 19;
/* number of codes used to transfer the bit lengths */

var HEAP_SIZE     = 2 * L_CODES + 1;
/* maximum heap size */

var MAX_BITS      = 15;
/* All codes must not exceed MAX_BITS bits */

var Buf_size      = 16;
/* size of bit buffer in bi_buf */


/* ===========================================================================
 * Constants
 */

var MAX_BL_BITS = 7;
/* Bit length codes must not exceed MAX_BL_BITS bits */

var END_BLOCK   = 256;
/* end of block literal code */

var REP_3_6     = 16;
/* repeat previous bit length 3-6 times (2 bits of repeat count) */

var REPZ_3_10   = 17;
/* repeat a zero length 3-10 times  (3 bits of repeat count) */

var REPZ_11_138 = 18;
/* repeat a zero length 11-138 times  (7 bits of repeat count) */

/* eslint-disable comma-spacing,array-bracket-spacing */
var extra_lbits =   /* extra bits for each length code */
  [0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0];

var extra_dbits =   /* extra bits for each distance code */
  [0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13];

var extra_blbits =  /* extra bits for each bit length code */
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,7];

var bl_order =
  [16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];
/* eslint-enable comma-spacing,array-bracket-spacing */

/* The lengths of the bit length codes are sent in order of decreasing
 * probability, to avoid transmitting the lengths for unused bit length codes.
 */

/* ===========================================================================
 * Local data. These are initialized only once.
 */

// We pre-fill arrays with 0 to avoid uninitialized gaps

var DIST_CODE_LEN = 512; /* see definition of array dist_code below */

// !!!! Use flat array instead of structure, Freq = i*2, Len = i*2+1
var static_ltree  = new Array((L_CODES + 2) * 2);
zero(static_ltree);
/* The static literal tree. Since the bit lengths are imposed, there is no
 * need for the L_CODES extra codes used during heap construction. However
 * The codes 286 and 287 are needed to build a canonical tree (see _tr_init
 * below).
 */

var static_dtree  = new Array(D_CODES * 2);
zero(static_dtree);
/* The static distance tree. (Actually a trivial tree since all codes use
 * 5 bits.)
 */

var _dist_code    = new Array(DIST_CODE_LEN);
zero(_dist_code);
/* Distance codes. The first 256 values correspond to the distances
 * 3 .. 258, the last 256 values correspond to the top 8 bits of
 * the 15 bit distances.
 */

var _length_code  = new Array(MAX_MATCH - MIN_MATCH + 1);
zero(_length_code);
/* length code for each normalized match length (0 == MIN_MATCH) */

var base_length   = new Array(LENGTH_CODES);
zero(base_length);
/* First normalized length for each code (0 = MIN_MATCH) */

var base_dist     = new Array(D_CODES);
zero(base_dist);
/* First normalized distance for each code (0 = distance of 1) */


function StaticTreeDesc(static_tree, extra_bits, extra_base, elems, max_length) {

  this.static_tree  = static_tree;  /* static tree or NULL */
  this.extra_bits   = extra_bits;   /* extra bits for each code or NULL */
  this.extra_base   = extra_base;   /* base index for extra_bits */
  this.elems        = elems;        /* max number of elements in the tree */
  this.max_length   = max_length;   /* max bit length for the codes */

  // show if `static_tree` has data or dummy - needed for monomorphic objects
  this.has_stree    = static_tree && static_tree.length;
}


var static_l_desc;
var static_d_desc;
var static_bl_desc;


function TreeDesc(dyn_tree, stat_desc) {
  this.dyn_tree = dyn_tree;     /* the dynamic tree */
  this.max_code = 0;            /* largest code with non zero frequency */
  this.stat_desc = stat_desc;   /* the corresponding static tree */
}



function d_code(dist) {
  return dist < 256 ? _dist_code[dist] : _dist_code[256 + (dist >>> 7)];
}


/* ===========================================================================
 * Output a short LSB first on the stream.
 * IN assertion: there is enough room in pendingBuf.
 */
function put_short(s, w) {
//    put_byte(s, (uch)((w) & 0xff));
//    put_byte(s, (uch)((ush)(w) >> 8));
  s.pending_buf[s.pending++] = (w) & 0xff;
  s.pending_buf[s.pending++] = (w >>> 8) & 0xff;
}


/* ===========================================================================
 * Send a value on a given number of bits.
 * IN assertion: length <= 16 and value fits in length bits.
 */
function send_bits(s, value, length) {
  if (s.bi_valid > (Buf_size - length)) {
    s.bi_buf |= (value << s.bi_valid) & 0xffff;
    put_short(s, s.bi_buf);
    s.bi_buf = value >> (Buf_size - s.bi_valid);
    s.bi_valid += length - Buf_size;
  } else {
    s.bi_buf |= (value << s.bi_valid) & 0xffff;
    s.bi_valid += length;
  }
}


function send_code(s, c, tree) {
  send_bits(s, tree[c * 2]/*.Code*/, tree[c * 2 + 1]/*.Len*/);
}


/* ===========================================================================
 * Reverse the first len bits of a code, using straightforward code (a faster
 * method would use a table)
 * IN assertion: 1 <= len <= 15
 */
function bi_reverse(code, len) {
  var res = 0;
  do {
    res |= code & 1;
    code >>>= 1;
    res <<= 1;
  } while (--len > 0);
  return res >>> 1;
}


/* ===========================================================================
 * Flush the bit buffer, keeping at most 7 bits in it.
 */
function bi_flush(s) {
  if (s.bi_valid === 16) {
    put_short(s, s.bi_buf);
    s.bi_buf = 0;
    s.bi_valid = 0;

  } else if (s.bi_valid >= 8) {
    s.pending_buf[s.pending++] = s.bi_buf & 0xff;
    s.bi_buf >>= 8;
    s.bi_valid -= 8;
  }
}


/* ===========================================================================
 * Compute the optimal bit lengths for a tree and update the total bit length
 * for the current block.
 * IN assertion: the fields freq and dad are set, heap[heap_max] and
 *    above are the tree nodes sorted by increasing frequency.
 * OUT assertions: the field len is set to the optimal bit length, the
 *     array bl_count contains the frequencies for each bit length.
 *     The length opt_len is updated; static_len is also updated if stree is
 *     not null.
 */
function gen_bitlen(s, desc)
//    deflate_state *s;
//    tree_desc *desc;    /* the tree descriptor */
{
  var tree            = desc.dyn_tree;
  var max_code        = desc.max_code;
  var stree           = desc.stat_desc.static_tree;
  var has_stree       = desc.stat_desc.has_stree;
  var extra           = desc.stat_desc.extra_bits;
  var base            = desc.stat_desc.extra_base;
  var max_length      = desc.stat_desc.max_length;
  var h;              /* heap index */
  var n, m;           /* iterate over the tree elements */
  var bits;           /* bit length */
  var xbits;          /* extra bits */
  var f;              /* frequency */
  var overflow = 0;   /* number of elements with bit length too large */

  for (bits = 0; bits <= MAX_BITS; bits++) {
    s.bl_count[bits] = 0;
  }

  /* In a first pass, compute the optimal bit lengths (which may
   * overflow in the case of the bit length tree).
   */
  tree[s.heap[s.heap_max] * 2 + 1]/*.Len*/ = 0; /* root of the heap */

  for (h = s.heap_max + 1; h < HEAP_SIZE; h++) {
    n = s.heap[h];
    bits = tree[tree[n * 2 + 1]/*.Dad*/ * 2 + 1]/*.Len*/ + 1;
    if (bits > max_length) {
      bits = max_length;
      overflow++;
    }
    tree[n * 2 + 1]/*.Len*/ = bits;
    /* We overwrite tree[n].Dad which is no longer needed */

    if (n > max_code) { continue; } /* not a leaf node */

    s.bl_count[bits]++;
    xbits = 0;
    if (n >= base) {
      xbits = extra[n - base];
    }
    f = tree[n * 2]/*.Freq*/;
    s.opt_len += f * (bits + xbits);
    if (has_stree) {
      s.static_len += f * (stree[n * 2 + 1]/*.Len*/ + xbits);
    }
  }
  if (overflow === 0) { return; }

  // Trace((stderr,"\nbit length overflow\n"));
  /* This happens for example on obj2 and pic of the Calgary corpus */

  /* Find the first bit length which could increase: */
  do {
    bits = max_length - 1;
    while (s.bl_count[bits] === 0) { bits--; }
    s.bl_count[bits]--;      /* move one leaf down the tree */
    s.bl_count[bits + 1] += 2; /* move one overflow item as its brother */
    s.bl_count[max_length]--;
    /* The brother of the overflow item also moves one step up,
     * but this does not affect bl_count[max_length]
     */
    overflow -= 2;
  } while (overflow > 0);

  /* Now recompute all bit lengths, scanning in increasing frequency.
   * h is still equal to HEAP_SIZE. (It is simpler to reconstruct all
   * lengths instead of fixing only the wrong ones. This idea is taken
   * from 'ar' written by Haruhiko Okumura.)
   */
  for (bits = max_length; bits !== 0; bits--) {
    n = s.bl_count[bits];
    while (n !== 0) {
      m = s.heap[--h];
      if (m > max_code) { continue; }
      if (tree[m * 2 + 1]/*.Len*/ !== bits) {
        // Trace((stderr,"code %d bits %d->%d\n", m, tree[m].Len, bits));
        s.opt_len += (bits - tree[m * 2 + 1]/*.Len*/) * tree[m * 2]/*.Freq*/;
        tree[m * 2 + 1]/*.Len*/ = bits;
      }
      n--;
    }
  }
}


/* ===========================================================================
 * Generate the codes for a given tree and bit counts (which need not be
 * optimal).
 * IN assertion: the array bl_count contains the bit length statistics for
 * the given tree and the field len is set for all tree elements.
 * OUT assertion: the field code is set for all tree elements of non
 *     zero code length.
 */
function gen_codes(tree, max_code, bl_count)
//    ct_data *tree;             /* the tree to decorate */
//    int max_code;              /* largest code with non zero frequency */
//    ushf *bl_count;            /* number of codes at each bit length */
{
  var next_code = new Array(MAX_BITS + 1); /* next code value for each bit length */
  var code = 0;              /* running code value */
  var bits;                  /* bit index */
  var n;                     /* code index */

  /* The distribution counts are first used to generate the code values
   * without bit reversal.
   */
  for (bits = 1; bits <= MAX_BITS; bits++) {
    next_code[bits] = code = (code + bl_count[bits - 1]) << 1;
  }
  /* Check that the bit counts in bl_count are consistent. The last code
   * must be all ones.
   */
  //Assert (code + bl_count[MAX_BITS]-1 == (1<<MAX_BITS)-1,
  //        "inconsistent bit counts");
  //Tracev((stderr,"\ngen_codes: max_code %d ", max_code));

  for (n = 0;  n <= max_code; n++) {
    var len = tree[n * 2 + 1]/*.Len*/;
    if (len === 0) { continue; }
    /* Now reverse the bits */
    tree[n * 2]/*.Code*/ = bi_reverse(next_code[len]++, len);

    //Tracecv(tree != static_ltree, (stderr,"\nn %3d %c l %2d c %4x (%x) ",
    //     n, (isgraph(n) ? n : ' '), len, tree[n].Code, next_code[len]-1));
  }
}


/* ===========================================================================
 * Initialize the various 'constant' tables.
 */
function tr_static_init() {
  var n;        /* iterates over tree elements */
  var bits;     /* bit counter */
  var length;   /* length value */
  var code;     /* code value */
  var dist;     /* distance index */
  var bl_count = new Array(MAX_BITS + 1);
  /* number of codes at each bit length for an optimal tree */

  // do check in _tr_init()
  //if (static_init_done) return;

  /* For some embedded targets, global variables are not initialized: */
/*#ifdef NO_INIT_GLOBAL_POINTERS
  static_l_desc.static_tree = static_ltree;
  static_l_desc.extra_bits = extra_lbits;
  static_d_desc.static_tree = static_dtree;
  static_d_desc.extra_bits = extra_dbits;
  static_bl_desc.extra_bits = extra_blbits;
#endif*/

  /* Initialize the mapping length (0..255) -> length code (0..28) */
  length = 0;
  for (code = 0; code < LENGTH_CODES - 1; code++) {
    base_length[code] = length;
    for (n = 0; n < (1 << extra_lbits[code]); n++) {
      _length_code[length++] = code;
    }
  }
  //Assert (length == 256, "tr_static_init: length != 256");
  /* Note that the length 255 (match length 258) can be represented
   * in two different ways: code 284 + 5 bits or code 285, so we
   * overwrite length_code[255] to use the best encoding:
   */
  _length_code[length - 1] = code;

  /* Initialize the mapping dist (0..32K) -> dist code (0..29) */
  dist = 0;
  for (code = 0; code < 16; code++) {
    base_dist[code] = dist;
    for (n = 0; n < (1 << extra_dbits[code]); n++) {
      _dist_code[dist++] = code;
    }
  }
  //Assert (dist == 256, "tr_static_init: dist != 256");
  dist >>= 7; /* from now on, all distances are divided by 128 */
  for (; code < D_CODES; code++) {
    base_dist[code] = dist << 7;
    for (n = 0; n < (1 << (extra_dbits[code] - 7)); n++) {
      _dist_code[256 + dist++] = code;
    }
  }
  //Assert (dist == 256, "tr_static_init: 256+dist != 512");

  /* Construct the codes of the static literal tree */
  for (bits = 0; bits <= MAX_BITS; bits++) {
    bl_count[bits] = 0;
  }

  n = 0;
  while (n <= 143) {
    static_ltree[n * 2 + 1]/*.Len*/ = 8;
    n++;
    bl_count[8]++;
  }
  while (n <= 255) {
    static_ltree[n * 2 + 1]/*.Len*/ = 9;
    n++;
    bl_count[9]++;
  }
  while (n <= 279) {
    static_ltree[n * 2 + 1]/*.Len*/ = 7;
    n++;
    bl_count[7]++;
  }
  while (n <= 287) {
    static_ltree[n * 2 + 1]/*.Len*/ = 8;
    n++;
    bl_count[8]++;
  }
  /* Codes 286 and 287 do not exist, but we must include them in the
   * tree construction to get a canonical Huffman tree (longest code
   * all ones)
   */
  gen_codes(static_ltree, L_CODES + 1, bl_count);

  /* The static distance tree is trivial: */
  for (n = 0; n < D_CODES; n++) {
    static_dtree[n * 2 + 1]/*.Len*/ = 5;
    static_dtree[n * 2]/*.Code*/ = bi_reverse(n, 5);
  }

  // Now data ready and we can init static trees
  static_l_desc = new StaticTreeDesc(static_ltree, extra_lbits, LITERALS + 1, L_CODES, MAX_BITS);
  static_d_desc = new StaticTreeDesc(static_dtree, extra_dbits, 0,          D_CODES, MAX_BITS);
  static_bl_desc = new StaticTreeDesc(new Array(0), extra_blbits, 0,         BL_CODES, MAX_BL_BITS);

  //static_init_done = true;
}


/* ===========================================================================
 * Initialize a new block.
 */
function init_block(s) {
  var n; /* iterates over tree elements */

  /* Initialize the trees. */
  for (n = 0; n < L_CODES;  n++) { s.dyn_ltree[n * 2]/*.Freq*/ = 0; }
  for (n = 0; n < D_CODES;  n++) { s.dyn_dtree[n * 2]/*.Freq*/ = 0; }
  for (n = 0; n < BL_CODES; n++) { s.bl_tree[n * 2]/*.Freq*/ = 0; }

  s.dyn_ltree[END_BLOCK * 2]/*.Freq*/ = 1;
  s.opt_len = s.static_len = 0;
  s.last_lit = s.matches = 0;
}


/* ===========================================================================
 * Flush the bit buffer and align the output on a byte boundary
 */
function bi_windup(s)
{
  if (s.bi_valid > 8) {
    put_short(s, s.bi_buf);
  } else if (s.bi_valid > 0) {
    //put_byte(s, (Byte)s->bi_buf);
    s.pending_buf[s.pending++] = s.bi_buf;
  }
  s.bi_buf = 0;
  s.bi_valid = 0;
}

/* ===========================================================================
 * Copy a stored block, storing first the length and its
 * one's complement if requested.
 */
function copy_block(s, buf, len, header)
//DeflateState *s;
//charf    *buf;    /* the input data */
//unsigned len;     /* its length */
//int      header;  /* true if block header must be written */
{
  bi_windup(s);        /* align on byte boundary */

  if (header) {
    put_short(s, len);
    put_short(s, ~len);
  }
//  while (len--) {
//    put_byte(s, *buf++);
//  }
  utils.arraySet(s.pending_buf, s.window, buf, len, s.pending);
  s.pending += len;
}

/* ===========================================================================
 * Compares to subtrees, using the tree depth as tie breaker when
 * the subtrees have equal frequency. This minimizes the worst case length.
 */
function smaller(tree, n, m, depth) {
  var _n2 = n * 2;
  var _m2 = m * 2;
  return (tree[_n2]/*.Freq*/ < tree[_m2]/*.Freq*/ ||
         (tree[_n2]/*.Freq*/ === tree[_m2]/*.Freq*/ && depth[n] <= depth[m]));
}

/* ===========================================================================
 * Restore the heap property by moving down the tree starting at node k,
 * exchanging a node with the smallest of its two sons if necessary, stopping
 * when the heap property is re-established (each father smaller than its
 * two sons).
 */
function pqdownheap(s, tree, k)
//    deflate_state *s;
//    ct_data *tree;  /* the tree to restore */
//    int k;               /* node to move down */
{
  var v = s.heap[k];
  var j = k << 1;  /* left son of k */
  while (j <= s.heap_len) {
    /* Set j to the smallest of the two sons: */
    if (j < s.heap_len &&
      smaller(tree, s.heap[j + 1], s.heap[j], s.depth)) {
      j++;
    }
    /* Exit if v is smaller than both sons */
    if (smaller(tree, v, s.heap[j], s.depth)) { break; }

    /* Exchange v with the smallest son */
    s.heap[k] = s.heap[j];
    k = j;

    /* And continue down the tree, setting j to the left son of k */
    j <<= 1;
  }
  s.heap[k] = v;
}


// inlined manually
// var SMALLEST = 1;

/* ===========================================================================
 * Send the block data compressed using the given Huffman trees
 */
function compress_block(s, ltree, dtree)
//    deflate_state *s;
//    const ct_data *ltree; /* literal tree */
//    const ct_data *dtree; /* distance tree */
{
  var dist;           /* distance of matched string */
  var lc;             /* match length or unmatched char (if dist == 0) */
  var lx = 0;         /* running index in l_buf */
  var code;           /* the code to send */
  var extra;          /* number of extra bits to send */

  if (s.last_lit !== 0) {
    do {
      dist = (s.pending_buf[s.d_buf + lx * 2] << 8) | (s.pending_buf[s.d_buf + lx * 2 + 1]);
      lc = s.pending_buf[s.l_buf + lx];
      lx++;

      if (dist === 0) {
        send_code(s, lc, ltree); /* send a literal byte */
        //Tracecv(isgraph(lc), (stderr," '%c' ", lc));
      } else {
        /* Here, lc is the match length - MIN_MATCH */
        code = _length_code[lc];
        send_code(s, code + LITERALS + 1, ltree); /* send the length code */
        extra = extra_lbits[code];
        if (extra !== 0) {
          lc -= base_length[code];
          send_bits(s, lc, extra);       /* send the extra length bits */
        }
        dist--; /* dist is now the match distance - 1 */
        code = d_code(dist);
        //Assert (code < D_CODES, "bad d_code");

        send_code(s, code, dtree);       /* send the distance code */
        extra = extra_dbits[code];
        if (extra !== 0) {
          dist -= base_dist[code];
          send_bits(s, dist, extra);   /* send the extra distance bits */
        }
      } /* literal or match pair ? */

      /* Check that the overlay between pending_buf and d_buf+l_buf is ok: */
      //Assert((uInt)(s->pending) < s->lit_bufsize + 2*lx,
      //       "pendingBuf overflow");

    } while (lx < s.last_lit);
  }

  send_code(s, END_BLOCK, ltree);
}


/* ===========================================================================
 * Construct one Huffman tree and assigns the code bit strings and lengths.
 * Update the total bit length for the current block.
 * IN assertion: the field freq is set for all tree elements.
 * OUT assertions: the fields len and code are set to the optimal bit length
 *     and corresponding code. The length opt_len is updated; static_len is
 *     also updated if stree is not null. The field max_code is set.
 */
function build_tree(s, desc)
//    deflate_state *s;
//    tree_desc *desc; /* the tree descriptor */
{
  var tree     = desc.dyn_tree;
  var stree    = desc.stat_desc.static_tree;
  var has_stree = desc.stat_desc.has_stree;
  var elems    = desc.stat_desc.elems;
  var n, m;          /* iterate over heap elements */
  var max_code = -1; /* largest code with non zero frequency */
  var node;          /* new node being created */

  /* Construct the initial heap, with least frequent element in
   * heap[SMALLEST]. The sons of heap[n] are heap[2*n] and heap[2*n+1].
   * heap[0] is not used.
   */
  s.heap_len = 0;
  s.heap_max = HEAP_SIZE;

  for (n = 0; n < elems; n++) {
    if (tree[n * 2]/*.Freq*/ !== 0) {
      s.heap[++s.heap_len] = max_code = n;
      s.depth[n] = 0;

    } else {
      tree[n * 2 + 1]/*.Len*/ = 0;
    }
  }

  /* The pkzip format requires that at least one distance code exists,
   * and that at least one bit should be sent even if there is only one
   * possible code. So to avoid special checks later on we force at least
   * two codes of non zero frequency.
   */
  while (s.heap_len < 2) {
    node = s.heap[++s.heap_len] = (max_code < 2 ? ++max_code : 0);
    tree[node * 2]/*.Freq*/ = 1;
    s.depth[node] = 0;
    s.opt_len--;

    if (has_stree) {
      s.static_len -= stree[node * 2 + 1]/*.Len*/;
    }
    /* node is 0 or 1 so it does not have extra bits */
  }
  desc.max_code = max_code;

  /* The elements heap[heap_len/2+1 .. heap_len] are leaves of the tree,
   * establish sub-heaps of increasing lengths:
   */
  for (n = (s.heap_len >> 1/*int /2*/); n >= 1; n--) { pqdownheap(s, tree, n); }

  /* Construct the Huffman tree by repeatedly combining the least two
   * frequent nodes.
   */
  node = elems;              /* next internal node of the tree */
  do {
    //pqremove(s, tree, n);  /* n = node of least frequency */
    /*** pqremove ***/
    n = s.heap[1/*SMALLEST*/];
    s.heap[1/*SMALLEST*/] = s.heap[s.heap_len--];
    pqdownheap(s, tree, 1/*SMALLEST*/);
    /***/

    m = s.heap[1/*SMALLEST*/]; /* m = node of next least frequency */

    s.heap[--s.heap_max] = n; /* keep the nodes sorted by frequency */
    s.heap[--s.heap_max] = m;

    /* Create a new node father of n and m */
    tree[node * 2]/*.Freq*/ = tree[n * 2]/*.Freq*/ + tree[m * 2]/*.Freq*/;
    s.depth[node] = (s.depth[n] >= s.depth[m] ? s.depth[n] : s.depth[m]) + 1;
    tree[n * 2 + 1]/*.Dad*/ = tree[m * 2 + 1]/*.Dad*/ = node;

    /* and insert the new node in the heap */
    s.heap[1/*SMALLEST*/] = node++;
    pqdownheap(s, tree, 1/*SMALLEST*/);

  } while (s.heap_len >= 2);

  s.heap[--s.heap_max] = s.heap[1/*SMALLEST*/];

  /* At this point, the fields freq and dad are set. We can now
   * generate the bit lengths.
   */
  gen_bitlen(s, desc);

  /* The field len is now set, we can generate the bit codes */
  gen_codes(tree, max_code, s.bl_count);
}


/* ===========================================================================
 * Scan a literal or distance tree to determine the frequencies of the codes
 * in the bit length tree.
 */
function scan_tree(s, tree, max_code)
//    deflate_state *s;
//    ct_data *tree;   /* the tree to be scanned */
//    int max_code;    /* and its largest code of non zero frequency */
{
  var n;                     /* iterates over all tree elements */
  var prevlen = -1;          /* last emitted length */
  var curlen;                /* length of current code */

  var nextlen = tree[0 * 2 + 1]/*.Len*/; /* length of next code */

  var count = 0;             /* repeat count of the current code */
  var max_count = 7;         /* max repeat count */
  var min_count = 4;         /* min repeat count */

  if (nextlen === 0) {
    max_count = 138;
    min_count = 3;
  }
  tree[(max_code + 1) * 2 + 1]/*.Len*/ = 0xffff; /* guard */

  for (n = 0; n <= max_code; n++) {
    curlen = nextlen;
    nextlen = tree[(n + 1) * 2 + 1]/*.Len*/;

    if (++count < max_count && curlen === nextlen) {
      continue;

    } else if (count < min_count) {
      s.bl_tree[curlen * 2]/*.Freq*/ += count;

    } else if (curlen !== 0) {

      if (curlen !== prevlen) { s.bl_tree[curlen * 2]/*.Freq*/++; }
      s.bl_tree[REP_3_6 * 2]/*.Freq*/++;

    } else if (count <= 10) {
      s.bl_tree[REPZ_3_10 * 2]/*.Freq*/++;

    } else {
      s.bl_tree[REPZ_11_138 * 2]/*.Freq*/++;
    }

    count = 0;
    prevlen = curlen;

    if (nextlen === 0) {
      max_count = 138;
      min_count = 3;

    } else if (curlen === nextlen) {
      max_count = 6;
      min_count = 3;

    } else {
      max_count = 7;
      min_count = 4;
    }
  }
}


/* ===========================================================================
 * Send a literal or distance tree in compressed form, using the codes in
 * bl_tree.
 */
function send_tree(s, tree, max_code)
//    deflate_state *s;
//    ct_data *tree; /* the tree to be scanned */
//    int max_code;       /* and its largest code of non zero frequency */
{
  var n;                     /* iterates over all tree elements */
  var prevlen = -1;          /* last emitted length */
  var curlen;                /* length of current code */

  var nextlen = tree[0 * 2 + 1]/*.Len*/; /* length of next code */

  var count = 0;             /* repeat count of the current code */
  var max_count = 7;         /* max repeat count */
  var min_count = 4;         /* min repeat count */

  /* tree[max_code+1].Len = -1; */  /* guard already set */
  if (nextlen === 0) {
    max_count = 138;
    min_count = 3;
  }

  for (n = 0; n <= max_code; n++) {
    curlen = nextlen;
    nextlen = tree[(n + 1) * 2 + 1]/*.Len*/;

    if (++count < max_count && curlen === nextlen) {
      continue;

    } else if (count < min_count) {
      do { send_code(s, curlen, s.bl_tree); } while (--count !== 0);

    } else if (curlen !== 0) {
      if (curlen !== prevlen) {
        send_code(s, curlen, s.bl_tree);
        count--;
      }
      //Assert(count >= 3 && count <= 6, " 3_6?");
      send_code(s, REP_3_6, s.bl_tree);
      send_bits(s, count - 3, 2);

    } else if (count <= 10) {
      send_code(s, REPZ_3_10, s.bl_tree);
      send_bits(s, count - 3, 3);

    } else {
      send_code(s, REPZ_11_138, s.bl_tree);
      send_bits(s, count - 11, 7);
    }

    count = 0;
    prevlen = curlen;
    if (nextlen === 0) {
      max_count = 138;
      min_count = 3;

    } else if (curlen === nextlen) {
      max_count = 6;
      min_count = 3;

    } else {
      max_count = 7;
      min_count = 4;
    }
  }
}


/* ===========================================================================
 * Construct the Huffman tree for the bit lengths and return the index in
 * bl_order of the last bit length code to send.
 */
function build_bl_tree(s) {
  var max_blindex;  /* index of last bit length code of non zero freq */

  /* Determine the bit length frequencies for literal and distance trees */
  scan_tree(s, s.dyn_ltree, s.l_desc.max_code);
  scan_tree(s, s.dyn_dtree, s.d_desc.max_code);

  /* Build the bit length tree: */
  build_tree(s, s.bl_desc);
  /* opt_len now includes the length of the tree representations, except
   * the lengths of the bit lengths codes and the 5+5+4 bits for the counts.
   */

  /* Determine the number of bit length codes to send. The pkzip format
   * requires that at least 4 bit length codes be sent. (appnote.txt says
   * 3 but the actual value used is 4.)
   */
  for (max_blindex = BL_CODES - 1; max_blindex >= 3; max_blindex--) {
    if (s.bl_tree[bl_order[max_blindex] * 2 + 1]/*.Len*/ !== 0) {
      break;
    }
  }
  /* Update opt_len to include the bit length tree and counts */
  s.opt_len += 3 * (max_blindex + 1) + 5 + 5 + 4;
  //Tracev((stderr, "\ndyn trees: dyn %ld, stat %ld",
  //        s->opt_len, s->static_len));

  return max_blindex;
}


/* ===========================================================================
 * Send the header for a block using dynamic Huffman trees: the counts, the
 * lengths of the bit length codes, the literal tree and the distance tree.
 * IN assertion: lcodes >= 257, dcodes >= 1, blcodes >= 4.
 */
function send_all_trees(s, lcodes, dcodes, blcodes)
//    deflate_state *s;
//    int lcodes, dcodes, blcodes; /* number of codes for each tree */
{
  var rank;                    /* index in bl_order */

  //Assert (lcodes >= 257 && dcodes >= 1 && blcodes >= 4, "not enough codes");
  //Assert (lcodes <= L_CODES && dcodes <= D_CODES && blcodes <= BL_CODES,
  //        "too many codes");
  //Tracev((stderr, "\nbl counts: "));
  send_bits(s, lcodes - 257, 5); /* not +255 as stated in appnote.txt */
  send_bits(s, dcodes - 1,   5);
  send_bits(s, blcodes - 4,  4); /* not -3 as stated in appnote.txt */
  for (rank = 0; rank < blcodes; rank++) {
    //Tracev((stderr, "\nbl code %2d ", bl_order[rank]));
    send_bits(s, s.bl_tree[bl_order[rank] * 2 + 1]/*.Len*/, 3);
  }
  //Tracev((stderr, "\nbl tree: sent %ld", s->bits_sent));

  send_tree(s, s.dyn_ltree, lcodes - 1); /* literal tree */
  //Tracev((stderr, "\nlit tree: sent %ld", s->bits_sent));

  send_tree(s, s.dyn_dtree, dcodes - 1); /* distance tree */
  //Tracev((stderr, "\ndist tree: sent %ld", s->bits_sent));
}


/* ===========================================================================
 * Check if the data type is TEXT or BINARY, using the following algorithm:
 * - TEXT if the two conditions below are satisfied:
 *    a) There are no non-portable control characters belonging to the
 *       "black list" (0..6, 14..25, 28..31).
 *    b) There is at least one printable character belonging to the
 *       "white list" (9 {TAB}, 10 {LF}, 13 {CR}, 32..255).
 * - BINARY otherwise.
 * - The following partially-portable control characters form a
 *   "gray list" that is ignored in this detection algorithm:
 *   (7 {BEL}, 8 {BS}, 11 {VT}, 12 {FF}, 26 {SUB}, 27 {ESC}).
 * IN assertion: the fields Freq of dyn_ltree are set.
 */
function detect_data_type(s) {
  /* black_mask is the bit mask of black-listed bytes
   * set bits 0..6, 14..25, and 28..31
   * 0xf3ffc07f = binary 11110011111111111100000001111111
   */
  var black_mask = 0xf3ffc07f;
  var n;

  /* Check for non-textual ("black-listed") bytes. */
  for (n = 0; n <= 31; n++, black_mask >>>= 1) {
    if ((black_mask & 1) && (s.dyn_ltree[n * 2]/*.Freq*/ !== 0)) {
      return Z_BINARY;
    }
  }

  /* Check for textual ("white-listed") bytes. */
  if (s.dyn_ltree[9 * 2]/*.Freq*/ !== 0 || s.dyn_ltree[10 * 2]/*.Freq*/ !== 0 ||
      s.dyn_ltree[13 * 2]/*.Freq*/ !== 0) {
    return Z_TEXT;
  }
  for (n = 32; n < LITERALS; n++) {
    if (s.dyn_ltree[n * 2]/*.Freq*/ !== 0) {
      return Z_TEXT;
    }
  }

  /* There are no "black-listed" or "white-listed" bytes:
   * this stream either is empty or has tolerated ("gray-listed") bytes only.
   */
  return Z_BINARY;
}


var static_init_done = false;

/* ===========================================================================
 * Initialize the tree data structures for a new zlib stream.
 */
function _tr_init(s)
{

  if (!static_init_done) {
    tr_static_init();
    static_init_done = true;
  }

  s.l_desc  = new TreeDesc(s.dyn_ltree, static_l_desc);
  s.d_desc  = new TreeDesc(s.dyn_dtree, static_d_desc);
  s.bl_desc = new TreeDesc(s.bl_tree, static_bl_desc);

  s.bi_buf = 0;
  s.bi_valid = 0;

  /* Initialize the first block of the first file: */
  init_block(s);
}


/* ===========================================================================
 * Send a stored block
 */
function _tr_stored_block(s, buf, stored_len, last)
//DeflateState *s;
//charf *buf;       /* input block */
//ulg stored_len;   /* length of input block */
//int last;         /* one if this is the last block for a file */
{
  send_bits(s, (STORED_BLOCK << 1) + (last ? 1 : 0), 3);    /* send block type */
  copy_block(s, buf, stored_len, true); /* with header */
}


/* ===========================================================================
 * Send one empty static block to give enough lookahead for inflate.
 * This takes 10 bits, of which 7 may remain in the bit buffer.
 */
function _tr_align(s) {
  send_bits(s, STATIC_TREES << 1, 3);
  send_code(s, END_BLOCK, static_ltree);
  bi_flush(s);
}


/* ===========================================================================
 * Determine the best encoding for the current block: dynamic trees, static
 * trees or store, and output the encoded block to the zip file.
 */
function _tr_flush_block(s, buf, stored_len, last)
//DeflateState *s;
//charf *buf;       /* input block, or NULL if too old */
//ulg stored_len;   /* length of input block */
//int last;         /* one if this is the last block for a file */
{
  var opt_lenb, static_lenb;  /* opt_len and static_len in bytes */
  var max_blindex = 0;        /* index of last bit length code of non zero freq */

  /* Build the Huffman trees unless a stored block is forced */
  if (s.level > 0) {

    /* Check if the file is binary or text */
    if (s.strm.data_type === Z_UNKNOWN) {
      s.strm.data_type = detect_data_type(s);
    }

    /* Construct the literal and distance trees */
    build_tree(s, s.l_desc);
    // Tracev((stderr, "\nlit data: dyn %ld, stat %ld", s->opt_len,
    //        s->static_len));

    build_tree(s, s.d_desc);
    // Tracev((stderr, "\ndist data: dyn %ld, stat %ld", s->opt_len,
    //        s->static_len));
    /* At this point, opt_len and static_len are the total bit lengths of
     * the compressed block data, excluding the tree representations.
     */

    /* Build the bit length tree for the above two trees, and get the index
     * in bl_order of the last bit length code to send.
     */
    max_blindex = build_bl_tree(s);

    /* Determine the best encoding. Compute the block lengths in bytes. */
    opt_lenb = (s.opt_len + 3 + 7) >>> 3;
    static_lenb = (s.static_len + 3 + 7) >>> 3;

    // Tracev((stderr, "\nopt %lu(%lu) stat %lu(%lu) stored %lu lit %u ",
    //        opt_lenb, s->opt_len, static_lenb, s->static_len, stored_len,
    //        s->last_lit));

    if (static_lenb <= opt_lenb) { opt_lenb = static_lenb; }

  } else {
    // Assert(buf != (char*)0, "lost buf");
    opt_lenb = static_lenb = stored_len + 5; /* force a stored block */
  }

  if ((stored_len + 4 <= opt_lenb) && (buf !== -1)) {
    /* 4: two words for the lengths */

    /* The test buf != NULL is only necessary if LIT_BUFSIZE > WSIZE.
     * Otherwise we can't have processed more than WSIZE input bytes since
     * the last block flush, because compression would have been
     * successful. If LIT_BUFSIZE <= WSIZE, it is never too late to
     * transform a block into a stored block.
     */
    _tr_stored_block(s, buf, stored_len, last);

  } else if (s.strategy === Z_FIXED || static_lenb === opt_lenb) {

    send_bits(s, (STATIC_TREES << 1) + (last ? 1 : 0), 3);
    compress_block(s, static_ltree, static_dtree);

  } else {
    send_bits(s, (DYN_TREES << 1) + (last ? 1 : 0), 3);
    send_all_trees(s, s.l_desc.max_code + 1, s.d_desc.max_code + 1, max_blindex + 1);
    compress_block(s, s.dyn_ltree, s.dyn_dtree);
  }
  // Assert (s->compressed_len == s->bits_sent, "bad compressed size");
  /* The above check is made mod 2^32, for files larger than 512 MB
   * and uLong implemented on 32 bits.
   */
  init_block(s);

  if (last) {
    bi_windup(s);
  }
  // Tracev((stderr,"\ncomprlen %lu(%lu) ", s->compressed_len>>3,
  //       s->compressed_len-7*last));
}

/* ===========================================================================
 * Save the match info and tally the frequency counts. Return true if
 * the current block must be flushed.
 */
function _tr_tally(s, dist, lc)
//    deflate_state *s;
//    unsigned dist;  /* distance of matched string */
//    unsigned lc;    /* match length-MIN_MATCH or unmatched char (if dist==0) */
{
  //var out_length, in_length, dcode;

  s.pending_buf[s.d_buf + s.last_lit * 2]     = (dist >>> 8) & 0xff;
  s.pending_buf[s.d_buf + s.last_lit * 2 + 1] = dist & 0xff;

  s.pending_buf[s.l_buf + s.last_lit] = lc & 0xff;
  s.last_lit++;

  if (dist === 0) {
    /* lc is the unmatched char */
    s.dyn_ltree[lc * 2]/*.Freq*/++;
  } else {
    s.matches++;
    /* Here, lc is the match length - MIN_MATCH */
    dist--;             /* dist = match distance - 1 */
    //Assert((ush)dist < (ush)MAX_DIST(s) &&
    //       (ush)lc <= (ush)(MAX_MATCH-MIN_MATCH) &&
    //       (ush)d_code(dist) < (ush)D_CODES,  "_tr_tally: bad match");

    s.dyn_ltree[(_length_code[lc] + LITERALS + 1) * 2]/*.Freq*/++;
    s.dyn_dtree[d_code(dist) * 2]/*.Freq*/++;
  }

// (!) This block is disabled in zlib defaults,
// don't enable it for binary compatibility

//#ifdef TRUNCATE_BLOCK
//  /* Try to guess if it is profitable to stop the current block here */
//  if ((s.last_lit & 0x1fff) === 0 && s.level > 2) {
//    /* Compute an upper bound for the compressed length */
//    out_length = s.last_lit*8;
//    in_length = s.strstart - s.block_start;
//
//    for (dcode = 0; dcode < D_CODES; dcode++) {
//      out_length += s.dyn_dtree[dcode*2]/*.Freq*/ * (5 + extra_dbits[dcode]);
//    }
//    out_length >>>= 3;
//    //Tracev((stderr,"\nlast_lit %u, in %ld, out ~%ld(%ld%%) ",
//    //       s->last_lit, in_length, out_length,
//    //       100L - out_length*100L/in_length));
//    if (s.matches < (s.last_lit>>1)/*int /2*/ && out_length < (in_length>>1)/*int /2*/) {
//      return true;
//    }
//  }
//#endif

  return (s.last_lit === s.lit_bufsize - 1);
  /* We avoid equality with lit_bufsize because of wraparound at 64K
   * on 16 bit machines and because stored blocks are restricted to
   * 64K-1 bytes.
   */
}

exports._tr_init  = _tr_init;
exports._tr_stored_block = _tr_stored_block;
exports._tr_flush_block  = _tr_flush_block;
exports._tr_tally = _tr_tally;
exports._tr_align = _tr_align;


/***/ }),

/***/ "21eb":
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process, Buffer) {

(function() {

// ARMv6 (Raspberry Pi) has bug in bitwise operations
// https://code.google.com/p/v8/issues/detail?id=3757
// https://github.com/alexeyten/qr-image/issues/13
if (process.arch === 'arm') {
    module.exports = __webpack_require__("de6e");
    return;
}

var crc_table = [];

(function() {
    for (var n = 0; n < 256; n++) {
        var c = n;
        for (var k = 0; k < 8; k++) {
            if (c & 1) {
                c = 0xedb88320 ^ (c >>> 1);
            } else {
                c = c >>> 1;
            }
        }
        crc_table[n] = c >>> 0;
    }
})();

function update(c, buf) {
    var l = buf.length;
    for (var n = 0; n < l; n++) {
        c = crc_table[(c ^ buf[n]) & 0xff] ^ (c >>> 8);
    }
    return c;
}

function crc32(/* arguments */) {
    var l = arguments.length;
    var c = -1;
    for (var i = 0; i < l; i++) {
        c = update(c, new Buffer(arguments[i]));
    }
    c = (c ^ -1) >>> 0;
    return c;
}

module.exports = crc32;
    
})();

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__("4362"), __webpack_require__("b639").Buffer))

/***/ }),

/***/ "2ceb":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

module.exports = {

  /* Allowed flush values; see deflate() and inflate() below for details */
  Z_NO_FLUSH:         0,
  Z_PARTIAL_FLUSH:    1,
  Z_SYNC_FLUSH:       2,
  Z_FULL_FLUSH:       3,
  Z_FINISH:           4,
  Z_BLOCK:            5,
  Z_TREES:            6,

  /* Return codes for the compression/decompression functions. Negative values
  * are errors, positive values are used for special but normal events.
  */
  Z_OK:               0,
  Z_STREAM_END:       1,
  Z_NEED_DICT:        2,
  Z_ERRNO:           -1,
  Z_STREAM_ERROR:    -2,
  Z_DATA_ERROR:      -3,
  //Z_MEM_ERROR:     -4,
  Z_BUF_ERROR:       -5,
  //Z_VERSION_ERROR: -6,

  /* compression levels */
  Z_NO_COMPRESSION:         0,
  Z_BEST_SPEED:             1,
  Z_BEST_COMPRESSION:       9,
  Z_DEFAULT_COMPRESSION:   -1,


  Z_FILTERED:               1,
  Z_HUFFMAN_ONLY:           2,
  Z_RLE:                    3,
  Z_FIXED:                  4,
  Z_DEFAULT_STRATEGY:       0,

  /* Possible values of the data_type field (though see inflate()) */
  Z_BINARY:                 0,
  Z_TEXT:                   1,
  //Z_ASCII:                1, // = Z_TEXT (deprecated)
  Z_UNKNOWN:                2,

  /* The deflate compression method */
  Z_DEFLATED:               8
  //Z_NULL:                 null // Use -1 or null inline, depending on var type
};


/***/ }),

/***/ "470b":
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {

var Buffer = __webpack_require__("b639").Buffer;
var Transform = __webpack_require__("d485").Transform;
var binding = __webpack_require__("6b75");
var util = __webpack_require__("3022");
var assert = __webpack_require__("f654").ok;
var kMaxLength = __webpack_require__("b639").kMaxLength;
var kRangeErrorMessage = 'Cannot create final Buffer. It would be larger ' + 'than 0x' + kMaxLength.toString(16) + ' bytes';

// zlib doesn't provide these, so kludge them in following the same
// const naming scheme zlib uses.
binding.Z_MIN_WINDOWBITS = 8;
binding.Z_MAX_WINDOWBITS = 15;
binding.Z_DEFAULT_WINDOWBITS = 15;

// fewer than 64 bytes per chunk is stupid.
// technically it could work with as few as 8, but even 64 bytes
// is absurdly low.  Usually a MB or more is best.
binding.Z_MIN_CHUNK = 64;
binding.Z_MAX_CHUNK = Infinity;
binding.Z_DEFAULT_CHUNK = 16 * 1024;

binding.Z_MIN_MEMLEVEL = 1;
binding.Z_MAX_MEMLEVEL = 9;
binding.Z_DEFAULT_MEMLEVEL = 8;

binding.Z_MIN_LEVEL = -1;
binding.Z_MAX_LEVEL = 9;
binding.Z_DEFAULT_LEVEL = binding.Z_DEFAULT_COMPRESSION;

// expose all the zlib constants
var bkeys = Object.keys(binding);
for (var bk = 0; bk < bkeys.length; bk++) {
  var bkey = bkeys[bk];
  if (bkey.match(/^Z/)) {
    Object.defineProperty(exports, bkey, {
      enumerable: true, value: binding[bkey], writable: false
    });
  }
}

// translation table for return codes.
var codes = {
  Z_OK: binding.Z_OK,
  Z_STREAM_END: binding.Z_STREAM_END,
  Z_NEED_DICT: binding.Z_NEED_DICT,
  Z_ERRNO: binding.Z_ERRNO,
  Z_STREAM_ERROR: binding.Z_STREAM_ERROR,
  Z_DATA_ERROR: binding.Z_DATA_ERROR,
  Z_MEM_ERROR: binding.Z_MEM_ERROR,
  Z_BUF_ERROR: binding.Z_BUF_ERROR,
  Z_VERSION_ERROR: binding.Z_VERSION_ERROR
};

var ckeys = Object.keys(codes);
for (var ck = 0; ck < ckeys.length; ck++) {
  var ckey = ckeys[ck];
  codes[codes[ckey]] = ckey;
}

Object.defineProperty(exports, 'codes', {
  enumerable: true, value: Object.freeze(codes), writable: false
});

exports.Deflate = Deflate;
exports.Inflate = Inflate;
exports.Gzip = Gzip;
exports.Gunzip = Gunzip;
exports.DeflateRaw = DeflateRaw;
exports.InflateRaw = InflateRaw;
exports.Unzip = Unzip;

exports.createDeflate = function (o) {
  return new Deflate(o);
};

exports.createInflate = function (o) {
  return new Inflate(o);
};

exports.createDeflateRaw = function (o) {
  return new DeflateRaw(o);
};

exports.createInflateRaw = function (o) {
  return new InflateRaw(o);
};

exports.createGzip = function (o) {
  return new Gzip(o);
};

exports.createGunzip = function (o) {
  return new Gunzip(o);
};

exports.createUnzip = function (o) {
  return new Unzip(o);
};

// Convenience methods.
// compress/decompress a string or buffer in one step.
exports.deflate = function (buffer, opts, callback) {
  if (typeof opts === 'function') {
    callback = opts;
    opts = {};
  }
  return zlibBuffer(new Deflate(opts), buffer, callback);
};

exports.deflateSync = function (buffer, opts) {
  return zlibBufferSync(new Deflate(opts), buffer);
};

exports.gzip = function (buffer, opts, callback) {
  if (typeof opts === 'function') {
    callback = opts;
    opts = {};
  }
  return zlibBuffer(new Gzip(opts), buffer, callback);
};

exports.gzipSync = function (buffer, opts) {
  return zlibBufferSync(new Gzip(opts), buffer);
};

exports.deflateRaw = function (buffer, opts, callback) {
  if (typeof opts === 'function') {
    callback = opts;
    opts = {};
  }
  return zlibBuffer(new DeflateRaw(opts), buffer, callback);
};

exports.deflateRawSync = function (buffer, opts) {
  return zlibBufferSync(new DeflateRaw(opts), buffer);
};

exports.unzip = function (buffer, opts, callback) {
  if (typeof opts === 'function') {
    callback = opts;
    opts = {};
  }
  return zlibBuffer(new Unzip(opts), buffer, callback);
};

exports.unzipSync = function (buffer, opts) {
  return zlibBufferSync(new Unzip(opts), buffer);
};

exports.inflate = function (buffer, opts, callback) {
  if (typeof opts === 'function') {
    callback = opts;
    opts = {};
  }
  return zlibBuffer(new Inflate(opts), buffer, callback);
};

exports.inflateSync = function (buffer, opts) {
  return zlibBufferSync(new Inflate(opts), buffer);
};

exports.gunzip = function (buffer, opts, callback) {
  if (typeof opts === 'function') {
    callback = opts;
    opts = {};
  }
  return zlibBuffer(new Gunzip(opts), buffer, callback);
};

exports.gunzipSync = function (buffer, opts) {
  return zlibBufferSync(new Gunzip(opts), buffer);
};

exports.inflateRaw = function (buffer, opts, callback) {
  if (typeof opts === 'function') {
    callback = opts;
    opts = {};
  }
  return zlibBuffer(new InflateRaw(opts), buffer, callback);
};

exports.inflateRawSync = function (buffer, opts) {
  return zlibBufferSync(new InflateRaw(opts), buffer);
};

function zlibBuffer(engine, buffer, callback) {
  var buffers = [];
  var nread = 0;

  engine.on('error', onError);
  engine.on('end', onEnd);

  engine.end(buffer);
  flow();

  function flow() {
    var chunk;
    while (null !== (chunk = engine.read())) {
      buffers.push(chunk);
      nread += chunk.length;
    }
    engine.once('readable', flow);
  }

  function onError(err) {
    engine.removeListener('end', onEnd);
    engine.removeListener('readable', flow);
    callback(err);
  }

  function onEnd() {
    var buf;
    var err = null;

    if (nread >= kMaxLength) {
      err = new RangeError(kRangeErrorMessage);
    } else {
      buf = Buffer.concat(buffers, nread);
    }

    buffers = [];
    engine.close();
    callback(err, buf);
  }
}

function zlibBufferSync(engine, buffer) {
  if (typeof buffer === 'string') buffer = Buffer.from(buffer);

  if (!Buffer.isBuffer(buffer)) throw new TypeError('Not a string or buffer');

  var flushFlag = engine._finishFlushFlag;

  return engine._processChunk(buffer, flushFlag);
}

// generic zlib
// minimal 2-byte header
function Deflate(opts) {
  if (!(this instanceof Deflate)) return new Deflate(opts);
  Zlib.call(this, opts, binding.DEFLATE);
}

function Inflate(opts) {
  if (!(this instanceof Inflate)) return new Inflate(opts);
  Zlib.call(this, opts, binding.INFLATE);
}

// gzip - bigger header, same deflate compression
function Gzip(opts) {
  if (!(this instanceof Gzip)) return new Gzip(opts);
  Zlib.call(this, opts, binding.GZIP);
}

function Gunzip(opts) {
  if (!(this instanceof Gunzip)) return new Gunzip(opts);
  Zlib.call(this, opts, binding.GUNZIP);
}

// raw - no header
function DeflateRaw(opts) {
  if (!(this instanceof DeflateRaw)) return new DeflateRaw(opts);
  Zlib.call(this, opts, binding.DEFLATERAW);
}

function InflateRaw(opts) {
  if (!(this instanceof InflateRaw)) return new InflateRaw(opts);
  Zlib.call(this, opts, binding.INFLATERAW);
}

// auto-detect header.
function Unzip(opts) {
  if (!(this instanceof Unzip)) return new Unzip(opts);
  Zlib.call(this, opts, binding.UNZIP);
}

function isValidFlushFlag(flag) {
  return flag === binding.Z_NO_FLUSH || flag === binding.Z_PARTIAL_FLUSH || flag === binding.Z_SYNC_FLUSH || flag === binding.Z_FULL_FLUSH || flag === binding.Z_FINISH || flag === binding.Z_BLOCK;
}

// the Zlib class they all inherit from
// This thing manages the queue of requests, and returns
// true or false if there is anything in the queue when
// you call the .write() method.

function Zlib(opts, mode) {
  var _this = this;

  this._opts = opts = opts || {};
  this._chunkSize = opts.chunkSize || exports.Z_DEFAULT_CHUNK;

  Transform.call(this, opts);

  if (opts.flush && !isValidFlushFlag(opts.flush)) {
    throw new Error('Invalid flush flag: ' + opts.flush);
  }
  if (opts.finishFlush && !isValidFlushFlag(opts.finishFlush)) {
    throw new Error('Invalid flush flag: ' + opts.finishFlush);
  }

  this._flushFlag = opts.flush || binding.Z_NO_FLUSH;
  this._finishFlushFlag = typeof opts.finishFlush !== 'undefined' ? opts.finishFlush : binding.Z_FINISH;

  if (opts.chunkSize) {
    if (opts.chunkSize < exports.Z_MIN_CHUNK || opts.chunkSize > exports.Z_MAX_CHUNK) {
      throw new Error('Invalid chunk size: ' + opts.chunkSize);
    }
  }

  if (opts.windowBits) {
    if (opts.windowBits < exports.Z_MIN_WINDOWBITS || opts.windowBits > exports.Z_MAX_WINDOWBITS) {
      throw new Error('Invalid windowBits: ' + opts.windowBits);
    }
  }

  if (opts.level) {
    if (opts.level < exports.Z_MIN_LEVEL || opts.level > exports.Z_MAX_LEVEL) {
      throw new Error('Invalid compression level: ' + opts.level);
    }
  }

  if (opts.memLevel) {
    if (opts.memLevel < exports.Z_MIN_MEMLEVEL || opts.memLevel > exports.Z_MAX_MEMLEVEL) {
      throw new Error('Invalid memLevel: ' + opts.memLevel);
    }
  }

  if (opts.strategy) {
    if (opts.strategy != exports.Z_FILTERED && opts.strategy != exports.Z_HUFFMAN_ONLY && opts.strategy != exports.Z_RLE && opts.strategy != exports.Z_FIXED && opts.strategy != exports.Z_DEFAULT_STRATEGY) {
      throw new Error('Invalid strategy: ' + opts.strategy);
    }
  }

  if (opts.dictionary) {
    if (!Buffer.isBuffer(opts.dictionary)) {
      throw new Error('Invalid dictionary: it should be a Buffer instance');
    }
  }

  this._handle = new binding.Zlib(mode);

  var self = this;
  this._hadError = false;
  this._handle.onerror = function (message, errno) {
    // there is no way to cleanly recover.
    // continuing only obscures problems.
    _close(self);
    self._hadError = true;

    var error = new Error(message);
    error.errno = errno;
    error.code = exports.codes[errno];
    self.emit('error', error);
  };

  var level = exports.Z_DEFAULT_COMPRESSION;
  if (typeof opts.level === 'number') level = opts.level;

  var strategy = exports.Z_DEFAULT_STRATEGY;
  if (typeof opts.strategy === 'number') strategy = opts.strategy;

  this._handle.init(opts.windowBits || exports.Z_DEFAULT_WINDOWBITS, level, opts.memLevel || exports.Z_DEFAULT_MEMLEVEL, strategy, opts.dictionary);

  this._buffer = Buffer.allocUnsafe(this._chunkSize);
  this._offset = 0;
  this._level = level;
  this._strategy = strategy;

  this.once('end', this.close);

  Object.defineProperty(this, '_closed', {
    get: function () {
      return !_this._handle;
    },
    configurable: true,
    enumerable: true
  });
}

util.inherits(Zlib, Transform);

Zlib.prototype.params = function (level, strategy, callback) {
  if (level < exports.Z_MIN_LEVEL || level > exports.Z_MAX_LEVEL) {
    throw new RangeError('Invalid compression level: ' + level);
  }
  if (strategy != exports.Z_FILTERED && strategy != exports.Z_HUFFMAN_ONLY && strategy != exports.Z_RLE && strategy != exports.Z_FIXED && strategy != exports.Z_DEFAULT_STRATEGY) {
    throw new TypeError('Invalid strategy: ' + strategy);
  }

  if (this._level !== level || this._strategy !== strategy) {
    var self = this;
    this.flush(binding.Z_SYNC_FLUSH, function () {
      assert(self._handle, 'zlib binding closed');
      self._handle.params(level, strategy);
      if (!self._hadError) {
        self._level = level;
        self._strategy = strategy;
        if (callback) callback();
      }
    });
  } else {
    process.nextTick(callback);
  }
};

Zlib.prototype.reset = function () {
  assert(this._handle, 'zlib binding closed');
  return this._handle.reset();
};

// This is the _flush function called by the transform class,
// internally, when the last chunk has been written.
Zlib.prototype._flush = function (callback) {
  this._transform(Buffer.alloc(0), '', callback);
};

Zlib.prototype.flush = function (kind, callback) {
  var _this2 = this;

  var ws = this._writableState;

  if (typeof kind === 'function' || kind === undefined && !callback) {
    callback = kind;
    kind = binding.Z_FULL_FLUSH;
  }

  if (ws.ended) {
    if (callback) process.nextTick(callback);
  } else if (ws.ending) {
    if (callback) this.once('end', callback);
  } else if (ws.needDrain) {
    if (callback) {
      this.once('drain', function () {
        return _this2.flush(kind, callback);
      });
    }
  } else {
    this._flushFlag = kind;
    this.write(Buffer.alloc(0), '', callback);
  }
};

Zlib.prototype.close = function (callback) {
  _close(this, callback);
  process.nextTick(emitCloseNT, this);
};

function _close(engine, callback) {
  if (callback) process.nextTick(callback);

  // Caller may invoke .close after a zlib error (which will null _handle).
  if (!engine._handle) return;

  engine._handle.close();
  engine._handle = null;
}

function emitCloseNT(self) {
  self.emit('close');
}

Zlib.prototype._transform = function (chunk, encoding, cb) {
  var flushFlag;
  var ws = this._writableState;
  var ending = ws.ending || ws.ended;
  var last = ending && (!chunk || ws.length === chunk.length);

  if (chunk !== null && !Buffer.isBuffer(chunk)) return cb(new Error('invalid input'));

  if (!this._handle) return cb(new Error('zlib binding closed'));

  // If it's the last chunk, or a final flush, we use the Z_FINISH flush flag
  // (or whatever flag was provided using opts.finishFlush).
  // If it's explicitly flushing at some other time, then we use
  // Z_FULL_FLUSH. Otherwise, use Z_NO_FLUSH for maximum compression
  // goodness.
  if (last) flushFlag = this._finishFlushFlag;else {
    flushFlag = this._flushFlag;
    // once we've flushed the last of the queue, stop flushing and
    // go back to the normal behavior.
    if (chunk.length >= ws.length) {
      this._flushFlag = this._opts.flush || binding.Z_NO_FLUSH;
    }
  }

  this._processChunk(chunk, flushFlag, cb);
};

Zlib.prototype._processChunk = function (chunk, flushFlag, cb) {
  var availInBefore = chunk && chunk.length;
  var availOutBefore = this._chunkSize - this._offset;
  var inOff = 0;

  var self = this;

  var async = typeof cb === 'function';

  if (!async) {
    var buffers = [];
    var nread = 0;

    var error;
    this.on('error', function (er) {
      error = er;
    });

    assert(this._handle, 'zlib binding closed');
    do {
      var res = this._handle.writeSync(flushFlag, chunk, // in
      inOff, // in_off
      availInBefore, // in_len
      this._buffer, // out
      this._offset, //out_off
      availOutBefore); // out_len
    } while (!this._hadError && callback(res[0], res[1]));

    if (this._hadError) {
      throw error;
    }

    if (nread >= kMaxLength) {
      _close(this);
      throw new RangeError(kRangeErrorMessage);
    }

    var buf = Buffer.concat(buffers, nread);
    _close(this);

    return buf;
  }

  assert(this._handle, 'zlib binding closed');
  var req = this._handle.write(flushFlag, chunk, // in
  inOff, // in_off
  availInBefore, // in_len
  this._buffer, // out
  this._offset, //out_off
  availOutBefore); // out_len

  req.buffer = chunk;
  req.callback = callback;

  function callback(availInAfter, availOutAfter) {
    // When the callback is used in an async write, the callback's
    // context is the `req` object that was created. The req object
    // is === this._handle, and that's why it's important to null
    // out the values after they are done being used. `this._handle`
    // can stay in memory longer than the callback and buffer are needed.
    if (this) {
      this.buffer = null;
      this.callback = null;
    }

    if (self._hadError) return;

    var have = availOutBefore - availOutAfter;
    assert(have >= 0, 'have should not go down');

    if (have > 0) {
      var out = self._buffer.slice(self._offset, self._offset + have);
      self._offset += have;
      // serve some output to the consumer.
      if (async) {
        self.push(out);
      } else {
        buffers.push(out);
        nread += out.length;
      }
    }

    // exhausted the output buffer, or used all the input create a new one.
    if (availOutAfter === 0 || self._offset >= self._chunkSize) {
      availOutBefore = self._chunkSize;
      self._offset = 0;
      self._buffer = Buffer.allocUnsafe(self._chunkSize);
    }

    if (availOutAfter === 0) {
      // Not actually done.  Need to reprocess.
      // Also, update the availInBefore to the availInAfter value,
      // so that if we have to hit it a third (fourth, etc.) time,
      // it'll have the correct byte counts.
      inOff += availInBefore - availInAfter;
      availInBefore = availInAfter;

      if (!async) return true;

      var newReq = self._handle.write(flushFlag, chunk, inOff, availInBefore, self._buffer, self._offset, self._chunkSize);
      newReq.callback = callback; // this same function
      newReq.buffer = chunk;
      return;
    }

    if (!async) return false;

    // finished with the chunk.
    cb();
  }
};

util.inherits(Deflate, Zlib);
util.inherits(Inflate, Zlib);
util.inherits(Gzip, Zlib);
util.inherits(Gunzip, Zlib);
util.inherits(DeflateRaw, Zlib);
util.inherits(InflateRaw, Zlib);
util.inherits(Unzip, Zlib);
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__("4362")))

/***/ }),

/***/ "4b99":
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process, Buffer) {

var Readable = __webpack_require__("d485").Readable;

var QR = __webpack_require__("cf62").QR;
var png = __webpack_require__("72c5");
var vector = __webpack_require__("a605");

var fn_noop = function() {};

var BITMAP_OPTIONS = {
    parse_url: false,
    ec_level: 'M',
    size: 5,
    margin: 4,
    customize: null
};

var VECTOR_OPTIONS = {
    parse_url: false,
    ec_level: 'M',
    margin: 1,
    size: 0
};

function get_options(options, force_type) {
    if (typeof options === 'string') {
        options = { 'ec_level': options }
    } else {
        options = options || {};
    }
    var _options = {
        type: String(force_type || options.type || 'png').toLowerCase()
    };

    var defaults = _options.type == 'png' ? BITMAP_OPTIONS : VECTOR_OPTIONS;

    for (var k in defaults) {
        _options[k] = k in options ? options[k] : defaults[k];
    }

    return _options;
}

function qr_image(text, options) {
    options = get_options(options);

    var matrix = QR(text, options.ec_level, options.parse_url);
    var stream = new Readable();
    stream._read = fn_noop;

    switch (options.type) {
    case 'svg':
    case 'pdf':
    case 'eps':
        process.nextTick(function() {
            vector[options.type](matrix, stream, options.margin, options.size);
        });
        break;
    case 'svgpath':
        // deprecated, use svg_object method
        process.nextTick(function() {
            var obj = vector.svg_object(matrix, options.margin, options.size);
            stream.push(obj.path);
            stream.push(null);
        });
        break;
    case 'png':
    default:
        process.nextTick(function() {
            var bitmap = png.bitmap(matrix, options.size, options.margin);
            if (options.customize) {
                options.customize(bitmap);
            }
            png.png(bitmap, stream);
        });
    }

    return stream;
}

function qr_image_sync(text, options) {
    options = get_options(options);

    var matrix = QR(text, options.ec_level, options.parse_url);
    var stream = [];
    var result;

    switch (options.type) {
    case 'svg':
    case 'pdf':
    case 'eps':
        vector[options.type](matrix, stream, options.margin, options.size);
        result = stream.filter(Boolean).join('');
        break;
    case 'png':
    default:
        var bitmap = png.bitmap(matrix, options.size, options.margin);
        if (options.customize) {
            options.customize(bitmap);
        }
        png.png(bitmap, stream);
        result = Buffer.concat(stream.filter(Boolean));
    }

    return result;
}

function svg_object(text, options) {
    options = get_options(options, 'svg');

    var matrix = QR(text, options.ec_level);
    return vector.svg_object(matrix, options.margin);
}

module.exports = {
    matrix: QR,
    image: qr_image,
    imageSync: qr_image_sync,
    svgObject: svg_object
};

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__("4362"), __webpack_require__("b639").Buffer))

/***/ }),

/***/ "4dc6":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

module.exports = {
  2:      'need dictionary',     /* Z_NEED_DICT       2  */
  1:      'stream end',          /* Z_STREAM_END      1  */
  0:      '',                    /* Z_OK              0  */
  '-1':   'file error',          /* Z_ERRNO         (-1) */
  '-2':   'stream error',        /* Z_STREAM_ERROR  (-2) */
  '-3':   'data error',          /* Z_DATA_ERROR    (-3) */
  '-4':   'insufficient memory', /* Z_MEM_ERROR     (-4) */
  '-5':   'buffer error',        /* Z_BUF_ERROR     (-5) */
  '-6':   'incompatible version' /* Z_VERSION_ERROR (-6) */
};


/***/ }),

/***/ "6821":
/***/ (function(module, exports) {

module.exports=function(t){var e={};function r(n){if(e[n])return e[n].exports;var i=e[n]={i:n,l:!1,exports:{}};return t[n].call(i.exports,i,i.exports,r),i.l=!0,i.exports}return r.m=t,r.c=e,r.d=function(t,e,n){r.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:n})},r.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},r.t=function(t,e){if(1&e&&(t=r(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var n=Object.create(null);if(r.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var i in t)r.d(n,i,function(e){return t[e]}.bind(null,i));return n},r.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return r.d(e,"a",e),e},r.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},r.p="",r(r.s=62)}([function(t,e){"function"==typeof Object.create?t.exports=function(t,e){t.super_=e,t.prototype=Object.create(e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}})}:t.exports=function(t,e){t.super_=e;var r=function(){};r.prototype=e.prototype,t.prototype=new r,t.prototype.constructor=t}},function(t,e,r){var n=r(11),i=n.Buffer;function o(t,e){for(var r in t)e[r]=t[r]}function a(t,e,r){return i(t,e,r)}i.from&&i.alloc&&i.allocUnsafe&&i.allocUnsafeSlow?t.exports=n:(o(n,e),e.Buffer=a),o(i,a),a.from=function(t,e,r){if("number"==typeof t)throw new TypeError("Argument must not be a number");return i(t,e,r)},a.alloc=function(t,e,r){if("number"!=typeof t)throw new TypeError("Argument must be a number");var n=i(t);return void 0!==e?"string"==typeof r?n.fill(e,r):n.fill(e):n.fill(0),n},a.allocUnsafe=function(t){if("number"!=typeof t)throw new TypeError("Argument must be a number");return i(t)},a.allocUnsafeSlow=function(t){if("number"!=typeof t)throw new TypeError("Argument must be a number");return n.SlowBuffer(t)}},function(t,e,r){"use strict";var n=e;n.version=r(99).version,n.utils=r(100),n.rand=r(101),n.curve=r(18),n.curves=r(107),n.ec=r(115),n.eddsa=r(119)},function(t,e,r){(function(t){!function(t,e){"use strict";function n(t,e){if(!t)throw new Error(e||"Assertion failed")}function i(t,e){t.super_=e;var r=function(){};r.prototype=e.prototype,t.prototype=new r,t.prototype.constructor=t}function o(t,e,r){if(o.isBN(t))return t;this.negative=0,this.words=null,this.length=0,this.red=null,null!==t&&("le"!==e&&"be"!==e||(r=e,e=10),this._init(t||0,e||10,r||"be"))}var a;"object"==typeof t?t.exports=o:e.BN=o,o.BN=o,o.wordSize=26;try{a=r(98).Buffer}catch(t){}function f(t,e,r){for(var n=0,i=Math.min(t.length,r),o=e;o<i;o++){var a=t.charCodeAt(o)-48;n<<=4,n|=a>=49&&a<=54?a-49+10:a>=17&&a<=22?a-17+10:15&a}return n}function s(t,e,r,n){for(var i=0,o=Math.min(t.length,r),a=e;a<o;a++){var f=t.charCodeAt(a)-48;i*=n,i+=f>=49?f-49+10:f>=17?f-17+10:f}return i}o.isBN=function(t){return t instanceof o||null!==t&&"object"==typeof t&&t.constructor.wordSize===o.wordSize&&Array.isArray(t.words)},o.max=function(t,e){return t.cmp(e)>0?t:e},o.min=function(t,e){return t.cmp(e)<0?t:e},o.prototype._init=function(t,e,r){if("number"==typeof t)return this._initNumber(t,e,r);if("object"==typeof t)return this._initArray(t,e,r);"hex"===e&&(e=16),n(e===(0|e)&&e>=2&&e<=36);var i=0;"-"===(t=t.toString().replace(/\s+/g,""))[0]&&i++,16===e?this._parseHex(t,i):this._parseBase(t,e,i),"-"===t[0]&&(this.negative=1),this.strip(),"le"===r&&this._initArray(this.toArray(),e,r)},o.prototype._initNumber=function(t,e,r){t<0&&(this.negative=1,t=-t),t<67108864?(this.words=[67108863&t],this.length=1):t<4503599627370496?(this.words=[67108863&t,t/67108864&67108863],this.length=2):(n(t<9007199254740992),this.words=[67108863&t,t/67108864&67108863,1],this.length=3),"le"===r&&this._initArray(this.toArray(),e,r)},o.prototype._initArray=function(t,e,r){if(n("number"==typeof t.length),t.length<=0)return this.words=[0],this.length=1,this;this.length=Math.ceil(t.length/3),this.words=new Array(this.length);for(var i=0;i<this.length;i++)this.words[i]=0;var o,a,f=0;if("be"===r)for(i=t.length-1,o=0;i>=0;i-=3)a=t[i]|t[i-1]<<8|t[i-2]<<16,this.words[o]|=a<<f&67108863,this.words[o+1]=a>>>26-f&67108863,(f+=24)>=26&&(f-=26,o++);else if("le"===r)for(i=0,o=0;i<t.length;i+=3)a=t[i]|t[i+1]<<8|t[i+2]<<16,this.words[o]|=a<<f&67108863,this.words[o+1]=a>>>26-f&67108863,(f+=24)>=26&&(f-=26,o++);return this.strip()},o.prototype._parseHex=function(t,e){this.length=Math.ceil((t.length-e)/6),this.words=new Array(this.length);for(var r=0;r<this.length;r++)this.words[r]=0;var n,i,o=0;for(r=t.length-6,n=0;r>=e;r-=6)i=f(t,r,r+6),this.words[n]|=i<<o&67108863,this.words[n+1]|=i>>>26-o&4194303,(o+=24)>=26&&(o-=26,n++);r+6!==e&&(i=f(t,e,r+6),this.words[n]|=i<<o&67108863,this.words[n+1]|=i>>>26-o&4194303),this.strip()},o.prototype._parseBase=function(t,e,r){this.words=[0],this.length=1;for(var n=0,i=1;i<=67108863;i*=e)n++;n--,i=i/e|0;for(var o=t.length-r,a=o%n,f=Math.min(o,o-a)+r,c=0,u=r;u<f;u+=n)c=s(t,u,u+n,e),this.imuln(i),this.words[0]+c<67108864?this.words[0]+=c:this._iaddn(c);if(0!==a){var h=1;for(c=s(t,u,t.length,e),u=0;u<a;u++)h*=e;this.imuln(h),this.words[0]+c<67108864?this.words[0]+=c:this._iaddn(c)}},o.prototype.copy=function(t){t.words=new Array(this.length);for(var e=0;e<this.length;e++)t.words[e]=this.words[e];t.length=this.length,t.negative=this.negative,t.red=this.red},o.prototype.clone=function(){var t=new o(null);return this.copy(t),t},o.prototype._expand=function(t){for(;this.length<t;)this.words[this.length++]=0;return this},o.prototype.strip=function(){for(;this.length>1&&0===this.words[this.length-1];)this.length--;return this._normSign()},o.prototype._normSign=function(){return 1===this.length&&0===this.words[0]&&(this.negative=0),this},o.prototype.inspect=function(){return(this.red?"<BN-R: ":"<BN: ")+this.toString(16)+">"};var c=["","0","00","000","0000","00000","000000","0000000","00000000","000000000","0000000000","00000000000","000000000000","0000000000000","00000000000000","000000000000000","0000000000000000","00000000000000000","000000000000000000","0000000000000000000","00000000000000000000","000000000000000000000","0000000000000000000000","00000000000000000000000","000000000000000000000000","0000000000000000000000000"],u=[0,0,25,16,12,11,10,9,8,8,7,7,7,7,6,6,6,6,6,6,6,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],h=[0,0,33554432,43046721,16777216,48828125,60466176,40353607,16777216,43046721,1e7,19487171,35831808,62748517,7529536,11390625,16777216,24137569,34012224,47045881,64e6,4084101,5153632,6436343,7962624,9765625,11881376,14348907,17210368,20511149,243e5,28629151,33554432,39135393,45435424,52521875,60466176];function d(t,e,r){r.negative=e.negative^t.negative;var n=t.length+e.length|0;r.length=n,n=n-1|0;var i=0|t.words[0],o=0|e.words[0],a=i*o,f=67108863&a,s=a/67108864|0;r.words[0]=f;for(var c=1;c<n;c++){for(var u=s>>>26,h=67108863&s,d=Math.min(c,e.length-1),l=Math.max(0,c-t.length+1);l<=d;l++){var p=c-l|0;u+=(a=(i=0|t.words[p])*(o=0|e.words[l])+h)/67108864|0,h=67108863&a}r.words[c]=0|h,s=0|u}return 0!==s?r.words[c]=0|s:r.length--,r.strip()}o.prototype.toString=function(t,e){var r;if(t=t||10,e=0|e||1,16===t||"hex"===t){r="";for(var i=0,o=0,a=0;a<this.length;a++){var f=this.words[a],s=(16777215&(f<<i|o)).toString(16);r=0!==(o=f>>>24-i&16777215)||a!==this.length-1?c[6-s.length]+s+r:s+r,(i+=2)>=26&&(i-=26,a--)}for(0!==o&&(r=o.toString(16)+r);r.length%e!=0;)r="0"+r;return 0!==this.negative&&(r="-"+r),r}if(t===(0|t)&&t>=2&&t<=36){var d=u[t],l=h[t];r="";var p=this.clone();for(p.negative=0;!p.isZero();){var b=p.modn(l).toString(t);r=(p=p.idivn(l)).isZero()?b+r:c[d-b.length]+b+r}for(this.isZero()&&(r="0"+r);r.length%e!=0;)r="0"+r;return 0!==this.negative&&(r="-"+r),r}n(!1,"Base should be between 2 and 36")},o.prototype.toNumber=function(){var t=this.words[0];return 2===this.length?t+=67108864*this.words[1]:3===this.length&&1===this.words[2]?t+=4503599627370496+67108864*this.words[1]:this.length>2&&n(!1,"Number can only safely store up to 53 bits"),0!==this.negative?-t:t},o.prototype.toJSON=function(){return this.toString(16)},o.prototype.toBuffer=function(t,e){return n(void 0!==a),this.toArrayLike(a,t,e)},o.prototype.toArray=function(t,e){return this.toArrayLike(Array,t,e)},o.prototype.toArrayLike=function(t,e,r){var i=this.byteLength(),o=r||Math.max(1,i);n(i<=o,"byte array longer than desired length"),n(o>0,"Requested array length <= 0"),this.strip();var a,f,s="le"===e,c=new t(o),u=this.clone();if(s){for(f=0;!u.isZero();f++)a=u.andln(255),u.iushrn(8),c[f]=a;for(;f<o;f++)c[f]=0}else{for(f=0;f<o-i;f++)c[f]=0;for(f=0;!u.isZero();f++)a=u.andln(255),u.iushrn(8),c[o-f-1]=a}return c},Math.clz32?o.prototype._countBits=function(t){return 32-Math.clz32(t)}:o.prototype._countBits=function(t){var e=t,r=0;return e>=4096&&(r+=13,e>>>=13),e>=64&&(r+=7,e>>>=7),e>=8&&(r+=4,e>>>=4),e>=2&&(r+=2,e>>>=2),r+e},o.prototype._zeroBits=function(t){if(0===t)return 26;var e=t,r=0;return 0==(8191&e)&&(r+=13,e>>>=13),0==(127&e)&&(r+=7,e>>>=7),0==(15&e)&&(r+=4,e>>>=4),0==(3&e)&&(r+=2,e>>>=2),0==(1&e)&&r++,r},o.prototype.bitLength=function(){var t=this.words[this.length-1],e=this._countBits(t);return 26*(this.length-1)+e},o.prototype.zeroBits=function(){if(this.isZero())return 0;for(var t=0,e=0;e<this.length;e++){var r=this._zeroBits(this.words[e]);if(t+=r,26!==r)break}return t},o.prototype.byteLength=function(){return Math.ceil(this.bitLength()/8)},o.prototype.toTwos=function(t){return 0!==this.negative?this.abs().inotn(t).iaddn(1):this.clone()},o.prototype.fromTwos=function(t){return this.testn(t-1)?this.notn(t).iaddn(1).ineg():this.clone()},o.prototype.isNeg=function(){return 0!==this.negative},o.prototype.neg=function(){return this.clone().ineg()},o.prototype.ineg=function(){return this.isZero()||(this.negative^=1),this},o.prototype.iuor=function(t){for(;this.length<t.length;)this.words[this.length++]=0;for(var e=0;e<t.length;e++)this.words[e]=this.words[e]|t.words[e];return this.strip()},o.prototype.ior=function(t){return n(0==(this.negative|t.negative)),this.iuor(t)},o.prototype.or=function(t){return this.length>t.length?this.clone().ior(t):t.clone().ior(this)},o.prototype.uor=function(t){return this.length>t.length?this.clone().iuor(t):t.clone().iuor(this)},o.prototype.iuand=function(t){var e;e=this.length>t.length?t:this;for(var r=0;r<e.length;r++)this.words[r]=this.words[r]&t.words[r];return this.length=e.length,this.strip()},o.prototype.iand=function(t){return n(0==(this.negative|t.negative)),this.iuand(t)},o.prototype.and=function(t){return this.length>t.length?this.clone().iand(t):t.clone().iand(this)},o.prototype.uand=function(t){return this.length>t.length?this.clone().iuand(t):t.clone().iuand(this)},o.prototype.iuxor=function(t){var e,r;this.length>t.length?(e=this,r=t):(e=t,r=this);for(var n=0;n<r.length;n++)this.words[n]=e.words[n]^r.words[n];if(this!==e)for(;n<e.length;n++)this.words[n]=e.words[n];return this.length=e.length,this.strip()},o.prototype.ixor=function(t){return n(0==(this.negative|t.negative)),this.iuxor(t)},o.prototype.xor=function(t){return this.length>t.length?this.clone().ixor(t):t.clone().ixor(this)},o.prototype.uxor=function(t){return this.length>t.length?this.clone().iuxor(t):t.clone().iuxor(this)},o.prototype.inotn=function(t){n("number"==typeof t&&t>=0);var e=0|Math.ceil(t/26),r=t%26;this._expand(e),r>0&&e--;for(var i=0;i<e;i++)this.words[i]=67108863&~this.words[i];return r>0&&(this.words[i]=~this.words[i]&67108863>>26-r),this.strip()},o.prototype.notn=function(t){return this.clone().inotn(t)},o.prototype.setn=function(t,e){n("number"==typeof t&&t>=0);var r=t/26|0,i=t%26;return this._expand(r+1),this.words[r]=e?this.words[r]|1<<i:this.words[r]&~(1<<i),this.strip()},o.prototype.iadd=function(t){var e,r,n;if(0!==this.negative&&0===t.negative)return this.negative=0,e=this.isub(t),this.negative^=1,this._normSign();if(0===this.negative&&0!==t.negative)return t.negative=0,e=this.isub(t),t.negative=1,e._normSign();this.length>t.length?(r=this,n=t):(r=t,n=this);for(var i=0,o=0;o<n.length;o++)e=(0|r.words[o])+(0|n.words[o])+i,this.words[o]=67108863&e,i=e>>>26;for(;0!==i&&o<r.length;o++)e=(0|r.words[o])+i,this.words[o]=67108863&e,i=e>>>26;if(this.length=r.length,0!==i)this.words[this.length]=i,this.length++;else if(r!==this)for(;o<r.length;o++)this.words[o]=r.words[o];return this},o.prototype.add=function(t){var e;return 0!==t.negative&&0===this.negative?(t.negative=0,e=this.sub(t),t.negative^=1,e):0===t.negative&&0!==this.negative?(this.negative=0,e=t.sub(this),this.negative=1,e):this.length>t.length?this.clone().iadd(t):t.clone().iadd(this)},o.prototype.isub=function(t){if(0!==t.negative){t.negative=0;var e=this.iadd(t);return t.negative=1,e._normSign()}if(0!==this.negative)return this.negative=0,this.iadd(t),this.negative=1,this._normSign();var r,n,i=this.cmp(t);if(0===i)return this.negative=0,this.length=1,this.words[0]=0,this;i>0?(r=this,n=t):(r=t,n=this);for(var o=0,a=0;a<n.length;a++)o=(e=(0|r.words[a])-(0|n.words[a])+o)>>26,this.words[a]=67108863&e;for(;0!==o&&a<r.length;a++)o=(e=(0|r.words[a])+o)>>26,this.words[a]=67108863&e;if(0===o&&a<r.length&&r!==this)for(;a<r.length;a++)this.words[a]=r.words[a];return this.length=Math.max(this.length,a),r!==this&&(this.negative=1),this.strip()},o.prototype.sub=function(t){return this.clone().isub(t)};var l=function(t,e,r){var n,i,o,a=t.words,f=e.words,s=r.words,c=0,u=0|a[0],h=8191&u,d=u>>>13,l=0|a[1],p=8191&l,b=l>>>13,y=0|a[2],v=8191&y,g=y>>>13,m=0|a[3],_=8191&m,w=m>>>13,S=0|a[4],E=8191&S,M=S>>>13,A=0|a[5],x=8191&A,k=A>>>13,I=0|a[6],B=8191&I,R=I>>>13,P=0|a[7],T=8191&P,L=P>>>13,O=0|a[8],C=8191&O,j=O>>>13,N=0|a[9],D=8191&N,U=N>>>13,q=0|f[0],z=8191&q,F=q>>>13,K=0|f[1],Y=8191&K,V=K>>>13,H=0|f[2],W=8191&H,G=H>>>13,X=0|f[3],J=8191&X,Z=X>>>13,$=0|f[4],Q=8191&$,tt=$>>>13,et=0|f[5],rt=8191&et,nt=et>>>13,it=0|f[6],ot=8191&it,at=it>>>13,ft=0|f[7],st=8191&ft,ct=ft>>>13,ut=0|f[8],ht=8191&ut,dt=ut>>>13,lt=0|f[9],pt=8191&lt,bt=lt>>>13;r.negative=t.negative^e.negative,r.length=19;var yt=(c+(n=Math.imul(h,z))|0)+((8191&(i=(i=Math.imul(h,F))+Math.imul(d,z)|0))<<13)|0;c=((o=Math.imul(d,F))+(i>>>13)|0)+(yt>>>26)|0,yt&=67108863,n=Math.imul(p,z),i=(i=Math.imul(p,F))+Math.imul(b,z)|0,o=Math.imul(b,F);var vt=(c+(n=n+Math.imul(h,Y)|0)|0)+((8191&(i=(i=i+Math.imul(h,V)|0)+Math.imul(d,Y)|0))<<13)|0;c=((o=o+Math.imul(d,V)|0)+(i>>>13)|0)+(vt>>>26)|0,vt&=67108863,n=Math.imul(v,z),i=(i=Math.imul(v,F))+Math.imul(g,z)|0,o=Math.imul(g,F),n=n+Math.imul(p,Y)|0,i=(i=i+Math.imul(p,V)|0)+Math.imul(b,Y)|0,o=o+Math.imul(b,V)|0;var gt=(c+(n=n+Math.imul(h,W)|0)|0)+((8191&(i=(i=i+Math.imul(h,G)|0)+Math.imul(d,W)|0))<<13)|0;c=((o=o+Math.imul(d,G)|0)+(i>>>13)|0)+(gt>>>26)|0,gt&=67108863,n=Math.imul(_,z),i=(i=Math.imul(_,F))+Math.imul(w,z)|0,o=Math.imul(w,F),n=n+Math.imul(v,Y)|0,i=(i=i+Math.imul(v,V)|0)+Math.imul(g,Y)|0,o=o+Math.imul(g,V)|0,n=n+Math.imul(p,W)|0,i=(i=i+Math.imul(p,G)|0)+Math.imul(b,W)|0,o=o+Math.imul(b,G)|0;var mt=(c+(n=n+Math.imul(h,J)|0)|0)+((8191&(i=(i=i+Math.imul(h,Z)|0)+Math.imul(d,J)|0))<<13)|0;c=((o=o+Math.imul(d,Z)|0)+(i>>>13)|0)+(mt>>>26)|0,mt&=67108863,n=Math.imul(E,z),i=(i=Math.imul(E,F))+Math.imul(M,z)|0,o=Math.imul(M,F),n=n+Math.imul(_,Y)|0,i=(i=i+Math.imul(_,V)|0)+Math.imul(w,Y)|0,o=o+Math.imul(w,V)|0,n=n+Math.imul(v,W)|0,i=(i=i+Math.imul(v,G)|0)+Math.imul(g,W)|0,o=o+Math.imul(g,G)|0,n=n+Math.imul(p,J)|0,i=(i=i+Math.imul(p,Z)|0)+Math.imul(b,J)|0,o=o+Math.imul(b,Z)|0;var _t=(c+(n=n+Math.imul(h,Q)|0)|0)+((8191&(i=(i=i+Math.imul(h,tt)|0)+Math.imul(d,Q)|0))<<13)|0;c=((o=o+Math.imul(d,tt)|0)+(i>>>13)|0)+(_t>>>26)|0,_t&=67108863,n=Math.imul(x,z),i=(i=Math.imul(x,F))+Math.imul(k,z)|0,o=Math.imul(k,F),n=n+Math.imul(E,Y)|0,i=(i=i+Math.imul(E,V)|0)+Math.imul(M,Y)|0,o=o+Math.imul(M,V)|0,n=n+Math.imul(_,W)|0,i=(i=i+Math.imul(_,G)|0)+Math.imul(w,W)|0,o=o+Math.imul(w,G)|0,n=n+Math.imul(v,J)|0,i=(i=i+Math.imul(v,Z)|0)+Math.imul(g,J)|0,o=o+Math.imul(g,Z)|0,n=n+Math.imul(p,Q)|0,i=(i=i+Math.imul(p,tt)|0)+Math.imul(b,Q)|0,o=o+Math.imul(b,tt)|0;var wt=(c+(n=n+Math.imul(h,rt)|0)|0)+((8191&(i=(i=i+Math.imul(h,nt)|0)+Math.imul(d,rt)|0))<<13)|0;c=((o=o+Math.imul(d,nt)|0)+(i>>>13)|0)+(wt>>>26)|0,wt&=67108863,n=Math.imul(B,z),i=(i=Math.imul(B,F))+Math.imul(R,z)|0,o=Math.imul(R,F),n=n+Math.imul(x,Y)|0,i=(i=i+Math.imul(x,V)|0)+Math.imul(k,Y)|0,o=o+Math.imul(k,V)|0,n=n+Math.imul(E,W)|0,i=(i=i+Math.imul(E,G)|0)+Math.imul(M,W)|0,o=o+Math.imul(M,G)|0,n=n+Math.imul(_,J)|0,i=(i=i+Math.imul(_,Z)|0)+Math.imul(w,J)|0,o=o+Math.imul(w,Z)|0,n=n+Math.imul(v,Q)|0,i=(i=i+Math.imul(v,tt)|0)+Math.imul(g,Q)|0,o=o+Math.imul(g,tt)|0,n=n+Math.imul(p,rt)|0,i=(i=i+Math.imul(p,nt)|0)+Math.imul(b,rt)|0,o=o+Math.imul(b,nt)|0;var St=(c+(n=n+Math.imul(h,ot)|0)|0)+((8191&(i=(i=i+Math.imul(h,at)|0)+Math.imul(d,ot)|0))<<13)|0;c=((o=o+Math.imul(d,at)|0)+(i>>>13)|0)+(St>>>26)|0,St&=67108863,n=Math.imul(T,z),i=(i=Math.imul(T,F))+Math.imul(L,z)|0,o=Math.imul(L,F),n=n+Math.imul(B,Y)|0,i=(i=i+Math.imul(B,V)|0)+Math.imul(R,Y)|0,o=o+Math.imul(R,V)|0,n=n+Math.imul(x,W)|0,i=(i=i+Math.imul(x,G)|0)+Math.imul(k,W)|0,o=o+Math.imul(k,G)|0,n=n+Math.imul(E,J)|0,i=(i=i+Math.imul(E,Z)|0)+Math.imul(M,J)|0,o=o+Math.imul(M,Z)|0,n=n+Math.imul(_,Q)|0,i=(i=i+Math.imul(_,tt)|0)+Math.imul(w,Q)|0,o=o+Math.imul(w,tt)|0,n=n+Math.imul(v,rt)|0,i=(i=i+Math.imul(v,nt)|0)+Math.imul(g,rt)|0,o=o+Math.imul(g,nt)|0,n=n+Math.imul(p,ot)|0,i=(i=i+Math.imul(p,at)|0)+Math.imul(b,ot)|0,o=o+Math.imul(b,at)|0;var Et=(c+(n=n+Math.imul(h,st)|0)|0)+((8191&(i=(i=i+Math.imul(h,ct)|0)+Math.imul(d,st)|0))<<13)|0;c=((o=o+Math.imul(d,ct)|0)+(i>>>13)|0)+(Et>>>26)|0,Et&=67108863,n=Math.imul(C,z),i=(i=Math.imul(C,F))+Math.imul(j,z)|0,o=Math.imul(j,F),n=n+Math.imul(T,Y)|0,i=(i=i+Math.imul(T,V)|0)+Math.imul(L,Y)|0,o=o+Math.imul(L,V)|0,n=n+Math.imul(B,W)|0,i=(i=i+Math.imul(B,G)|0)+Math.imul(R,W)|0,o=o+Math.imul(R,G)|0,n=n+Math.imul(x,J)|0,i=(i=i+Math.imul(x,Z)|0)+Math.imul(k,J)|0,o=o+Math.imul(k,Z)|0,n=n+Math.imul(E,Q)|0,i=(i=i+Math.imul(E,tt)|0)+Math.imul(M,Q)|0,o=o+Math.imul(M,tt)|0,n=n+Math.imul(_,rt)|0,i=(i=i+Math.imul(_,nt)|0)+Math.imul(w,rt)|0,o=o+Math.imul(w,nt)|0,n=n+Math.imul(v,ot)|0,i=(i=i+Math.imul(v,at)|0)+Math.imul(g,ot)|0,o=o+Math.imul(g,at)|0,n=n+Math.imul(p,st)|0,i=(i=i+Math.imul(p,ct)|0)+Math.imul(b,st)|0,o=o+Math.imul(b,ct)|0;var Mt=(c+(n=n+Math.imul(h,ht)|0)|0)+((8191&(i=(i=i+Math.imul(h,dt)|0)+Math.imul(d,ht)|0))<<13)|0;c=((o=o+Math.imul(d,dt)|0)+(i>>>13)|0)+(Mt>>>26)|0,Mt&=67108863,n=Math.imul(D,z),i=(i=Math.imul(D,F))+Math.imul(U,z)|0,o=Math.imul(U,F),n=n+Math.imul(C,Y)|0,i=(i=i+Math.imul(C,V)|0)+Math.imul(j,Y)|0,o=o+Math.imul(j,V)|0,n=n+Math.imul(T,W)|0,i=(i=i+Math.imul(T,G)|0)+Math.imul(L,W)|0,o=o+Math.imul(L,G)|0,n=n+Math.imul(B,J)|0,i=(i=i+Math.imul(B,Z)|0)+Math.imul(R,J)|0,o=o+Math.imul(R,Z)|0,n=n+Math.imul(x,Q)|0,i=(i=i+Math.imul(x,tt)|0)+Math.imul(k,Q)|0,o=o+Math.imul(k,tt)|0,n=n+Math.imul(E,rt)|0,i=(i=i+Math.imul(E,nt)|0)+Math.imul(M,rt)|0,o=o+Math.imul(M,nt)|0,n=n+Math.imul(_,ot)|0,i=(i=i+Math.imul(_,at)|0)+Math.imul(w,ot)|0,o=o+Math.imul(w,at)|0,n=n+Math.imul(v,st)|0,i=(i=i+Math.imul(v,ct)|0)+Math.imul(g,st)|0,o=o+Math.imul(g,ct)|0,n=n+Math.imul(p,ht)|0,i=(i=i+Math.imul(p,dt)|0)+Math.imul(b,ht)|0,o=o+Math.imul(b,dt)|0;var At=(c+(n=n+Math.imul(h,pt)|0)|0)+((8191&(i=(i=i+Math.imul(h,bt)|0)+Math.imul(d,pt)|0))<<13)|0;c=((o=o+Math.imul(d,bt)|0)+(i>>>13)|0)+(At>>>26)|0,At&=67108863,n=Math.imul(D,Y),i=(i=Math.imul(D,V))+Math.imul(U,Y)|0,o=Math.imul(U,V),n=n+Math.imul(C,W)|0,i=(i=i+Math.imul(C,G)|0)+Math.imul(j,W)|0,o=o+Math.imul(j,G)|0,n=n+Math.imul(T,J)|0,i=(i=i+Math.imul(T,Z)|0)+Math.imul(L,J)|0,o=o+Math.imul(L,Z)|0,n=n+Math.imul(B,Q)|0,i=(i=i+Math.imul(B,tt)|0)+Math.imul(R,Q)|0,o=o+Math.imul(R,tt)|0,n=n+Math.imul(x,rt)|0,i=(i=i+Math.imul(x,nt)|0)+Math.imul(k,rt)|0,o=o+Math.imul(k,nt)|0,n=n+Math.imul(E,ot)|0,i=(i=i+Math.imul(E,at)|0)+Math.imul(M,ot)|0,o=o+Math.imul(M,at)|0,n=n+Math.imul(_,st)|0,i=(i=i+Math.imul(_,ct)|0)+Math.imul(w,st)|0,o=o+Math.imul(w,ct)|0,n=n+Math.imul(v,ht)|0,i=(i=i+Math.imul(v,dt)|0)+Math.imul(g,ht)|0,o=o+Math.imul(g,dt)|0;var xt=(c+(n=n+Math.imul(p,pt)|0)|0)+((8191&(i=(i=i+Math.imul(p,bt)|0)+Math.imul(b,pt)|0))<<13)|0;c=((o=o+Math.imul(b,bt)|0)+(i>>>13)|0)+(xt>>>26)|0,xt&=67108863,n=Math.imul(D,W),i=(i=Math.imul(D,G))+Math.imul(U,W)|0,o=Math.imul(U,G),n=n+Math.imul(C,J)|0,i=(i=i+Math.imul(C,Z)|0)+Math.imul(j,J)|0,o=o+Math.imul(j,Z)|0,n=n+Math.imul(T,Q)|0,i=(i=i+Math.imul(T,tt)|0)+Math.imul(L,Q)|0,o=o+Math.imul(L,tt)|0,n=n+Math.imul(B,rt)|0,i=(i=i+Math.imul(B,nt)|0)+Math.imul(R,rt)|0,o=o+Math.imul(R,nt)|0,n=n+Math.imul(x,ot)|0,i=(i=i+Math.imul(x,at)|0)+Math.imul(k,ot)|0,o=o+Math.imul(k,at)|0,n=n+Math.imul(E,st)|0,i=(i=i+Math.imul(E,ct)|0)+Math.imul(M,st)|0,o=o+Math.imul(M,ct)|0,n=n+Math.imul(_,ht)|0,i=(i=i+Math.imul(_,dt)|0)+Math.imul(w,ht)|0,o=o+Math.imul(w,dt)|0;var kt=(c+(n=n+Math.imul(v,pt)|0)|0)+((8191&(i=(i=i+Math.imul(v,bt)|0)+Math.imul(g,pt)|0))<<13)|0;c=((o=o+Math.imul(g,bt)|0)+(i>>>13)|0)+(kt>>>26)|0,kt&=67108863,n=Math.imul(D,J),i=(i=Math.imul(D,Z))+Math.imul(U,J)|0,o=Math.imul(U,Z),n=n+Math.imul(C,Q)|0,i=(i=i+Math.imul(C,tt)|0)+Math.imul(j,Q)|0,o=o+Math.imul(j,tt)|0,n=n+Math.imul(T,rt)|0,i=(i=i+Math.imul(T,nt)|0)+Math.imul(L,rt)|0,o=o+Math.imul(L,nt)|0,n=n+Math.imul(B,ot)|0,i=(i=i+Math.imul(B,at)|0)+Math.imul(R,ot)|0,o=o+Math.imul(R,at)|0,n=n+Math.imul(x,st)|0,i=(i=i+Math.imul(x,ct)|0)+Math.imul(k,st)|0,o=o+Math.imul(k,ct)|0,n=n+Math.imul(E,ht)|0,i=(i=i+Math.imul(E,dt)|0)+Math.imul(M,ht)|0,o=o+Math.imul(M,dt)|0;var It=(c+(n=n+Math.imul(_,pt)|0)|0)+((8191&(i=(i=i+Math.imul(_,bt)|0)+Math.imul(w,pt)|0))<<13)|0;c=((o=o+Math.imul(w,bt)|0)+(i>>>13)|0)+(It>>>26)|0,It&=67108863,n=Math.imul(D,Q),i=(i=Math.imul(D,tt))+Math.imul(U,Q)|0,o=Math.imul(U,tt),n=n+Math.imul(C,rt)|0,i=(i=i+Math.imul(C,nt)|0)+Math.imul(j,rt)|0,o=o+Math.imul(j,nt)|0,n=n+Math.imul(T,ot)|0,i=(i=i+Math.imul(T,at)|0)+Math.imul(L,ot)|0,o=o+Math.imul(L,at)|0,n=n+Math.imul(B,st)|0,i=(i=i+Math.imul(B,ct)|0)+Math.imul(R,st)|0,o=o+Math.imul(R,ct)|0,n=n+Math.imul(x,ht)|0,i=(i=i+Math.imul(x,dt)|0)+Math.imul(k,ht)|0,o=o+Math.imul(k,dt)|0;var Bt=(c+(n=n+Math.imul(E,pt)|0)|0)+((8191&(i=(i=i+Math.imul(E,bt)|0)+Math.imul(M,pt)|0))<<13)|0;c=((o=o+Math.imul(M,bt)|0)+(i>>>13)|0)+(Bt>>>26)|0,Bt&=67108863,n=Math.imul(D,rt),i=(i=Math.imul(D,nt))+Math.imul(U,rt)|0,o=Math.imul(U,nt),n=n+Math.imul(C,ot)|0,i=(i=i+Math.imul(C,at)|0)+Math.imul(j,ot)|0,o=o+Math.imul(j,at)|0,n=n+Math.imul(T,st)|0,i=(i=i+Math.imul(T,ct)|0)+Math.imul(L,st)|0,o=o+Math.imul(L,ct)|0,n=n+Math.imul(B,ht)|0,i=(i=i+Math.imul(B,dt)|0)+Math.imul(R,ht)|0,o=o+Math.imul(R,dt)|0;var Rt=(c+(n=n+Math.imul(x,pt)|0)|0)+((8191&(i=(i=i+Math.imul(x,bt)|0)+Math.imul(k,pt)|0))<<13)|0;c=((o=o+Math.imul(k,bt)|0)+(i>>>13)|0)+(Rt>>>26)|0,Rt&=67108863,n=Math.imul(D,ot),i=(i=Math.imul(D,at))+Math.imul(U,ot)|0,o=Math.imul(U,at),n=n+Math.imul(C,st)|0,i=(i=i+Math.imul(C,ct)|0)+Math.imul(j,st)|0,o=o+Math.imul(j,ct)|0,n=n+Math.imul(T,ht)|0,i=(i=i+Math.imul(T,dt)|0)+Math.imul(L,ht)|0,o=o+Math.imul(L,dt)|0;var Pt=(c+(n=n+Math.imul(B,pt)|0)|0)+((8191&(i=(i=i+Math.imul(B,bt)|0)+Math.imul(R,pt)|0))<<13)|0;c=((o=o+Math.imul(R,bt)|0)+(i>>>13)|0)+(Pt>>>26)|0,Pt&=67108863,n=Math.imul(D,st),i=(i=Math.imul(D,ct))+Math.imul(U,st)|0,o=Math.imul(U,ct),n=n+Math.imul(C,ht)|0,i=(i=i+Math.imul(C,dt)|0)+Math.imul(j,ht)|0,o=o+Math.imul(j,dt)|0;var Tt=(c+(n=n+Math.imul(T,pt)|0)|0)+((8191&(i=(i=i+Math.imul(T,bt)|0)+Math.imul(L,pt)|0))<<13)|0;c=((o=o+Math.imul(L,bt)|0)+(i>>>13)|0)+(Tt>>>26)|0,Tt&=67108863,n=Math.imul(D,ht),i=(i=Math.imul(D,dt))+Math.imul(U,ht)|0,o=Math.imul(U,dt);var Lt=(c+(n=n+Math.imul(C,pt)|0)|0)+((8191&(i=(i=i+Math.imul(C,bt)|0)+Math.imul(j,pt)|0))<<13)|0;c=((o=o+Math.imul(j,bt)|0)+(i>>>13)|0)+(Lt>>>26)|0,Lt&=67108863;var Ot=(c+(n=Math.imul(D,pt))|0)+((8191&(i=(i=Math.imul(D,bt))+Math.imul(U,pt)|0))<<13)|0;return c=((o=Math.imul(U,bt))+(i>>>13)|0)+(Ot>>>26)|0,Ot&=67108863,s[0]=yt,s[1]=vt,s[2]=gt,s[3]=mt,s[4]=_t,s[5]=wt,s[6]=St,s[7]=Et,s[8]=Mt,s[9]=At,s[10]=xt,s[11]=kt,s[12]=It,s[13]=Bt,s[14]=Rt,s[15]=Pt,s[16]=Tt,s[17]=Lt,s[18]=Ot,0!==c&&(s[19]=c,r.length++),r};function p(t,e,r){return(new b).mulp(t,e,r)}function b(t,e){this.x=t,this.y=e}Math.imul||(l=d),o.prototype.mulTo=function(t,e){var r=this.length+t.length;return 10===this.length&&10===t.length?l(this,t,e):r<63?d(this,t,e):r<1024?function(t,e,r){r.negative=e.negative^t.negative,r.length=t.length+e.length;for(var n=0,i=0,o=0;o<r.length-1;o++){var a=i;i=0;for(var f=67108863&n,s=Math.min(o,e.length-1),c=Math.max(0,o-t.length+1);c<=s;c++){var u=o-c,h=(0|t.words[u])*(0|e.words[c]),d=67108863&h;f=67108863&(d=d+f|0),i+=(a=(a=a+(h/67108864|0)|0)+(d>>>26)|0)>>>26,a&=67108863}r.words[o]=f,n=a,a=i}return 0!==n?r.words[o]=n:r.length--,r.strip()}(this,t,e):p(this,t,e)},b.prototype.makeRBT=function(t){for(var e=new Array(t),r=o.prototype._countBits(t)-1,n=0;n<t;n++)e[n]=this.revBin(n,r,t);return e},b.prototype.revBin=function(t,e,r){if(0===t||t===r-1)return t;for(var n=0,i=0;i<e;i++)n|=(1&t)<<e-i-1,t>>=1;return n},b.prototype.permute=function(t,e,r,n,i,o){for(var a=0;a<o;a++)n[a]=e[t[a]],i[a]=r[t[a]]},b.prototype.transform=function(t,e,r,n,i,o){this.permute(o,t,e,r,n,i);for(var a=1;a<i;a<<=1)for(var f=a<<1,s=Math.cos(2*Math.PI/f),c=Math.sin(2*Math.PI/f),u=0;u<i;u+=f)for(var h=s,d=c,l=0;l<a;l++){var p=r[u+l],b=n[u+l],y=r[u+l+a],v=n[u+l+a],g=h*y-d*v;v=h*v+d*y,y=g,r[u+l]=p+y,n[u+l]=b+v,r[u+l+a]=p-y,n[u+l+a]=b-v,l!==f&&(g=s*h-c*d,d=s*d+c*h,h=g)}},b.prototype.guessLen13b=function(t,e){var r=1|Math.max(e,t),n=1&r,i=0;for(r=r/2|0;r;r>>>=1)i++;return 1<<i+1+n},b.prototype.conjugate=function(t,e,r){if(!(r<=1))for(var n=0;n<r/2;n++){var i=t[n];t[n]=t[r-n-1],t[r-n-1]=i,i=e[n],e[n]=-e[r-n-1],e[r-n-1]=-i}},b.prototype.normalize13b=function(t,e){for(var r=0,n=0;n<e/2;n++){var i=8192*Math.round(t[2*n+1]/e)+Math.round(t[2*n]/e)+r;t[n]=67108863&i,r=i<67108864?0:i/67108864|0}return t},b.prototype.convert13b=function(t,e,r,i){for(var o=0,a=0;a<e;a++)o+=0|t[a],r[2*a]=8191&o,o>>>=13,r[2*a+1]=8191&o,o>>>=13;for(a=2*e;a<i;++a)r[a]=0;n(0===o),n(0==(-8192&o))},b.prototype.stub=function(t){for(var e=new Array(t),r=0;r<t;r++)e[r]=0;return e},b.prototype.mulp=function(t,e,r){var n=2*this.guessLen13b(t.length,e.length),i=this.makeRBT(n),o=this.stub(n),a=new Array(n),f=new Array(n),s=new Array(n),c=new Array(n),u=new Array(n),h=new Array(n),d=r.words;d.length=n,this.convert13b(t.words,t.length,a,n),this.convert13b(e.words,e.length,c,n),this.transform(a,o,f,s,n,i),this.transform(c,o,u,h,n,i);for(var l=0;l<n;l++){var p=f[l]*u[l]-s[l]*h[l];s[l]=f[l]*h[l]+s[l]*u[l],f[l]=p}return this.conjugate(f,s,n),this.transform(f,s,d,o,n,i),this.conjugate(d,o,n),this.normalize13b(d,n),r.negative=t.negative^e.negative,r.length=t.length+e.length,r.strip()},o.prototype.mul=function(t){var e=new o(null);return e.words=new Array(this.length+t.length),this.mulTo(t,e)},o.prototype.mulf=function(t){var e=new o(null);return e.words=new Array(this.length+t.length),p(this,t,e)},o.prototype.imul=function(t){return this.clone().mulTo(t,this)},o.prototype.imuln=function(t){n("number"==typeof t),n(t<67108864);for(var e=0,r=0;r<this.length;r++){var i=(0|this.words[r])*t,o=(67108863&i)+(67108863&e);e>>=26,e+=i/67108864|0,e+=o>>>26,this.words[r]=67108863&o}return 0!==e&&(this.words[r]=e,this.length++),this},o.prototype.muln=function(t){return this.clone().imuln(t)},o.prototype.sqr=function(){return this.mul(this)},o.prototype.isqr=function(){return this.imul(this.clone())},o.prototype.pow=function(t){var e=function(t){for(var e=new Array(t.bitLength()),r=0;r<e.length;r++){var n=r/26|0,i=r%26;e[r]=(t.words[n]&1<<i)>>>i}return e}(t);if(0===e.length)return new o(1);for(var r=this,n=0;n<e.length&&0===e[n];n++,r=r.sqr());if(++n<e.length)for(var i=r.sqr();n<e.length;n++,i=i.sqr())0!==e[n]&&(r=r.mul(i));return r},o.prototype.iushln=function(t){n("number"==typeof t&&t>=0);var e,r=t%26,i=(t-r)/26,o=67108863>>>26-r<<26-r;if(0!==r){var a=0;for(e=0;e<this.length;e++){var f=this.words[e]&o,s=(0|this.words[e])-f<<r;this.words[e]=s|a,a=f>>>26-r}a&&(this.words[e]=a,this.length++)}if(0!==i){for(e=this.length-1;e>=0;e--)this.words[e+i]=this.words[e];for(e=0;e<i;e++)this.words[e]=0;this.length+=i}return this.strip()},o.prototype.ishln=function(t){return n(0===this.negative),this.iushln(t)},o.prototype.iushrn=function(t,e,r){var i;n("number"==typeof t&&t>=0),i=e?(e-e%26)/26:0;var o=t%26,a=Math.min((t-o)/26,this.length),f=67108863^67108863>>>o<<o,s=r;if(i-=a,i=Math.max(0,i),s){for(var c=0;c<a;c++)s.words[c]=this.words[c];s.length=a}if(0===a);else if(this.length>a)for(this.length-=a,c=0;c<this.length;c++)this.words[c]=this.words[c+a];else this.words[0]=0,this.length=1;var u=0;for(c=this.length-1;c>=0&&(0!==u||c>=i);c--){var h=0|this.words[c];this.words[c]=u<<26-o|h>>>o,u=h&f}return s&&0!==u&&(s.words[s.length++]=u),0===this.length&&(this.words[0]=0,this.length=1),this.strip()},o.prototype.ishrn=function(t,e,r){return n(0===this.negative),this.iushrn(t,e,r)},o.prototype.shln=function(t){return this.clone().ishln(t)},o.prototype.ushln=function(t){return this.clone().iushln(t)},o.prototype.shrn=function(t){return this.clone().ishrn(t)},o.prototype.ushrn=function(t){return this.clone().iushrn(t)},o.prototype.testn=function(t){n("number"==typeof t&&t>=0);var e=t%26,r=(t-e)/26,i=1<<e;return!(this.length<=r)&&!!(this.words[r]&i)},o.prototype.imaskn=function(t){n("number"==typeof t&&t>=0);var e=t%26,r=(t-e)/26;if(n(0===this.negative,"imaskn works only with positive numbers"),this.length<=r)return this;if(0!==e&&r++,this.length=Math.min(r,this.length),0!==e){var i=67108863^67108863>>>e<<e;this.words[this.length-1]&=i}return this.strip()},o.prototype.maskn=function(t){return this.clone().imaskn(t)},o.prototype.iaddn=function(t){return n("number"==typeof t),n(t<67108864),t<0?this.isubn(-t):0!==this.negative?1===this.length&&(0|this.words[0])<t?(this.words[0]=t-(0|this.words[0]),this.negative=0,this):(this.negative=0,this.isubn(t),this.negative=1,this):this._iaddn(t)},o.prototype._iaddn=function(t){this.words[0]+=t;for(var e=0;e<this.length&&this.words[e]>=67108864;e++)this.words[e]-=67108864,e===this.length-1?this.words[e+1]=1:this.words[e+1]++;return this.length=Math.max(this.length,e+1),this},o.prototype.isubn=function(t){if(n("number"==typeof t),n(t<67108864),t<0)return this.iaddn(-t);if(0!==this.negative)return this.negative=0,this.iaddn(t),this.negative=1,this;if(this.words[0]-=t,1===this.length&&this.words[0]<0)this.words[0]=-this.words[0],this.negative=1;else for(var e=0;e<this.length&&this.words[e]<0;e++)this.words[e]+=67108864,this.words[e+1]-=1;return this.strip()},o.prototype.addn=function(t){return this.clone().iaddn(t)},o.prototype.subn=function(t){return this.clone().isubn(t)},o.prototype.iabs=function(){return this.negative=0,this},o.prototype.abs=function(){return this.clone().iabs()},o.prototype._ishlnsubmul=function(t,e,r){var i,o,a=t.length+r;this._expand(a);var f=0;for(i=0;i<t.length;i++){o=(0|this.words[i+r])+f;var s=(0|t.words[i])*e;f=((o-=67108863&s)>>26)-(s/67108864|0),this.words[i+r]=67108863&o}for(;i<this.length-r;i++)f=(o=(0|this.words[i+r])+f)>>26,this.words[i+r]=67108863&o;if(0===f)return this.strip();for(n(-1===f),f=0,i=0;i<this.length;i++)f=(o=-(0|this.words[i])+f)>>26,this.words[i]=67108863&o;return this.negative=1,this.strip()},o.prototype._wordDiv=function(t,e){var r=(this.length,t.length),n=this.clone(),i=t,a=0|i.words[i.length-1];0!==(r=26-this._countBits(a))&&(i=i.ushln(r),n.iushln(r),a=0|i.words[i.length-1]);var f,s=n.length-i.length;if("mod"!==e){(f=new o(null)).length=s+1,f.words=new Array(f.length);for(var c=0;c<f.length;c++)f.words[c]=0}var u=n.clone()._ishlnsubmul(i,1,s);0===u.negative&&(n=u,f&&(f.words[s]=1));for(var h=s-1;h>=0;h--){var d=67108864*(0|n.words[i.length+h])+(0|n.words[i.length+h-1]);for(d=Math.min(d/a|0,67108863),n._ishlnsubmul(i,d,h);0!==n.negative;)d--,n.negative=0,n._ishlnsubmul(i,1,h),n.isZero()||(n.negative^=1);f&&(f.words[h]=d)}return f&&f.strip(),n.strip(),"div"!==e&&0!==r&&n.iushrn(r),{div:f||null,mod:n}},o.prototype.divmod=function(t,e,r){return n(!t.isZero()),this.isZero()?{div:new o(0),mod:new o(0)}:0!==this.negative&&0===t.negative?(f=this.neg().divmod(t,e),"mod"!==e&&(i=f.div.neg()),"div"!==e&&(a=f.mod.neg(),r&&0!==a.negative&&a.iadd(t)),{div:i,mod:a}):0===this.negative&&0!==t.negative?(f=this.divmod(t.neg(),e),"mod"!==e&&(i=f.div.neg()),{div:i,mod:f.mod}):0!=(this.negative&t.negative)?(f=this.neg().divmod(t.neg(),e),"div"!==e&&(a=f.mod.neg(),r&&0!==a.negative&&a.isub(t)),{div:f.div,mod:a}):t.length>this.length||this.cmp(t)<0?{div:new o(0),mod:this}:1===t.length?"div"===e?{div:this.divn(t.words[0]),mod:null}:"mod"===e?{div:null,mod:new o(this.modn(t.words[0]))}:{div:this.divn(t.words[0]),mod:new o(this.modn(t.words[0]))}:this._wordDiv(t,e);var i,a,f},o.prototype.div=function(t){return this.divmod(t,"div",!1).div},o.prototype.mod=function(t){return this.divmod(t,"mod",!1).mod},o.prototype.umod=function(t){return this.divmod(t,"mod",!0).mod},o.prototype.divRound=function(t){var e=this.divmod(t);if(e.mod.isZero())return e.div;var r=0!==e.div.negative?e.mod.isub(t):e.mod,n=t.ushrn(1),i=t.andln(1),o=r.cmp(n);return o<0||1===i&&0===o?e.div:0!==e.div.negative?e.div.isubn(1):e.div.iaddn(1)},o.prototype.modn=function(t){n(t<=67108863);for(var e=(1<<26)%t,r=0,i=this.length-1;i>=0;i--)r=(e*r+(0|this.words[i]))%t;return r},o.prototype.idivn=function(t){n(t<=67108863);for(var e=0,r=this.length-1;r>=0;r--){var i=(0|this.words[r])+67108864*e;this.words[r]=i/t|0,e=i%t}return this.strip()},o.prototype.divn=function(t){return this.clone().idivn(t)},o.prototype.egcd=function(t){n(0===t.negative),n(!t.isZero());var e=this,r=t.clone();e=0!==e.negative?e.umod(t):e.clone();for(var i=new o(1),a=new o(0),f=new o(0),s=new o(1),c=0;e.isEven()&&r.isEven();)e.iushrn(1),r.iushrn(1),++c;for(var u=r.clone(),h=e.clone();!e.isZero();){for(var d=0,l=1;0==(e.words[0]&l)&&d<26;++d,l<<=1);if(d>0)for(e.iushrn(d);d-- >0;)(i.isOdd()||a.isOdd())&&(i.iadd(u),a.isub(h)),i.iushrn(1),a.iushrn(1);for(var p=0,b=1;0==(r.words[0]&b)&&p<26;++p,b<<=1);if(p>0)for(r.iushrn(p);p-- >0;)(f.isOdd()||s.isOdd())&&(f.iadd(u),s.isub(h)),f.iushrn(1),s.iushrn(1);e.cmp(r)>=0?(e.isub(r),i.isub(f),a.isub(s)):(r.isub(e),f.isub(i),s.isub(a))}return{a:f,b:s,gcd:r.iushln(c)}},o.prototype._invmp=function(t){n(0===t.negative),n(!t.isZero());var e=this,r=t.clone();e=0!==e.negative?e.umod(t):e.clone();for(var i,a=new o(1),f=new o(0),s=r.clone();e.cmpn(1)>0&&r.cmpn(1)>0;){for(var c=0,u=1;0==(e.words[0]&u)&&c<26;++c,u<<=1);if(c>0)for(e.iushrn(c);c-- >0;)a.isOdd()&&a.iadd(s),a.iushrn(1);for(var h=0,d=1;0==(r.words[0]&d)&&h<26;++h,d<<=1);if(h>0)for(r.iushrn(h);h-- >0;)f.isOdd()&&f.iadd(s),f.iushrn(1);e.cmp(r)>=0?(e.isub(r),a.isub(f)):(r.isub(e),f.isub(a))}return(i=0===e.cmpn(1)?a:f).cmpn(0)<0&&i.iadd(t),i},o.prototype.gcd=function(t){if(this.isZero())return t.abs();if(t.isZero())return this.abs();var e=this.clone(),r=t.clone();e.negative=0,r.negative=0;for(var n=0;e.isEven()&&r.isEven();n++)e.iushrn(1),r.iushrn(1);for(;;){for(;e.isEven();)e.iushrn(1);for(;r.isEven();)r.iushrn(1);var i=e.cmp(r);if(i<0){var o=e;e=r,r=o}else if(0===i||0===r.cmpn(1))break;e.isub(r)}return r.iushln(n)},o.prototype.invm=function(t){return this.egcd(t).a.umod(t)},o.prototype.isEven=function(){return 0==(1&this.words[0])},o.prototype.isOdd=function(){return 1==(1&this.words[0])},o.prototype.andln=function(t){return this.words[0]&t},o.prototype.bincn=function(t){n("number"==typeof t);var e=t%26,r=(t-e)/26,i=1<<e;if(this.length<=r)return this._expand(r+1),this.words[r]|=i,this;for(var o=i,a=r;0!==o&&a<this.length;a++){var f=0|this.words[a];o=(f+=o)>>>26,f&=67108863,this.words[a]=f}return 0!==o&&(this.words[a]=o,this.length++),this},o.prototype.isZero=function(){return 1===this.length&&0===this.words[0]},o.prototype.cmpn=function(t){var e,r=t<0;if(0!==this.negative&&!r)return-1;if(0===this.negative&&r)return 1;if(this.strip(),this.length>1)e=1;else{r&&(t=-t),n(t<=67108863,"Number is too big");var i=0|this.words[0];e=i===t?0:i<t?-1:1}return 0!==this.negative?0|-e:e},o.prototype.cmp=function(t){if(0!==this.negative&&0===t.negative)return-1;if(0===this.negative&&0!==t.negative)return 1;var e=this.ucmp(t);return 0!==this.negative?0|-e:e},o.prototype.ucmp=function(t){if(this.length>t.length)return 1;if(this.length<t.length)return-1;for(var e=0,r=this.length-1;r>=0;r--){var n=0|this.words[r],i=0|t.words[r];if(n!==i){n<i?e=-1:n>i&&(e=1);break}}return e},o.prototype.gtn=function(t){return 1===this.cmpn(t)},o.prototype.gt=function(t){return 1===this.cmp(t)},o.prototype.gten=function(t){return this.cmpn(t)>=0},o.prototype.gte=function(t){return this.cmp(t)>=0},o.prototype.ltn=function(t){return-1===this.cmpn(t)},o.prototype.lt=function(t){return-1===this.cmp(t)},o.prototype.lten=function(t){return this.cmpn(t)<=0},o.prototype.lte=function(t){return this.cmp(t)<=0},o.prototype.eqn=function(t){return 0===this.cmpn(t)},o.prototype.eq=function(t){return 0===this.cmp(t)},o.red=function(t){return new S(t)},o.prototype.toRed=function(t){return n(!this.red,"Already a number in reduction context"),n(0===this.negative,"red works only with positives"),t.convertTo(this)._forceRed(t)},o.prototype.fromRed=function(){return n(this.red,"fromRed works only with numbers in reduction context"),this.red.convertFrom(this)},o.prototype._forceRed=function(t){return this.red=t,this},o.prototype.forceRed=function(t){return n(!this.red,"Already a number in reduction context"),this._forceRed(t)},o.prototype.redAdd=function(t){return n(this.red,"redAdd works only with red numbers"),this.red.add(this,t)},o.prototype.redIAdd=function(t){return n(this.red,"redIAdd works only with red numbers"),this.red.iadd(this,t)},o.prototype.redSub=function(t){return n(this.red,"redSub works only with red numbers"),this.red.sub(this,t)},o.prototype.redISub=function(t){return n(this.red,"redISub works only with red numbers"),this.red.isub(this,t)},o.prototype.redShl=function(t){return n(this.red,"redShl works only with red numbers"),this.red.shl(this,t)},o.prototype.redMul=function(t){return n(this.red,"redMul works only with red numbers"),this.red._verify2(this,t),this.red.mul(this,t)},o.prototype.redIMul=function(t){return n(this.red,"redMul works only with red numbers"),this.red._verify2(this,t),this.red.imul(this,t)},o.prototype.redSqr=function(){return n(this.red,"redSqr works only with red numbers"),this.red._verify1(this),this.red.sqr(this)},o.prototype.redISqr=function(){return n(this.red,"redISqr works only with red numbers"),this.red._verify1(this),this.red.isqr(this)},o.prototype.redSqrt=function(){return n(this.red,"redSqrt works only with red numbers"),this.red._verify1(this),this.red.sqrt(this)},o.prototype.redInvm=function(){return n(this.red,"redInvm works only with red numbers"),this.red._verify1(this),this.red.invm(this)},o.prototype.redNeg=function(){return n(this.red,"redNeg works only with red numbers"),this.red._verify1(this),this.red.neg(this)},o.prototype.redPow=function(t){return n(this.red&&!t.red,"redPow(normalNum)"),this.red._verify1(this),this.red.pow(this,t)};var y={k256:null,p224:null,p192:null,p25519:null};function v(t,e){this.name=t,this.p=new o(e,16),this.n=this.p.bitLength(),this.k=new o(1).iushln(this.n).isub(this.p),this.tmp=this._tmp()}function g(){v.call(this,"k256","ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2f")}function m(){v.call(this,"p224","ffffffff ffffffff ffffffff ffffffff 00000000 00000000 00000001")}function _(){v.call(this,"p192","ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff")}function w(){v.call(this,"25519","7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed")}function S(t){if("string"==typeof t){var e=o._prime(t);this.m=e.p,this.prime=e}else n(t.gtn(1),"modulus must be greater than 1"),this.m=t,this.prime=null}function E(t){S.call(this,t),this.shift=this.m.bitLength(),this.shift%26!=0&&(this.shift+=26-this.shift%26),this.r=new o(1).iushln(this.shift),this.r2=this.imod(this.r.sqr()),this.rinv=this.r._invmp(this.m),this.minv=this.rinv.mul(this.r).isubn(1).div(this.m),this.minv=this.minv.umod(this.r),this.minv=this.r.sub(this.minv)}v.prototype._tmp=function(){var t=new o(null);return t.words=new Array(Math.ceil(this.n/13)),t},v.prototype.ireduce=function(t){var e,r=t;do{this.split(r,this.tmp),e=(r=(r=this.imulK(r)).iadd(this.tmp)).bitLength()}while(e>this.n);var n=e<this.n?-1:r.ucmp(this.p);return 0===n?(r.words[0]=0,r.length=1):n>0?r.isub(this.p):r.strip(),r},v.prototype.split=function(t,e){t.iushrn(this.n,0,e)},v.prototype.imulK=function(t){return t.imul(this.k)},i(g,v),g.prototype.split=function(t,e){for(var r=Math.min(t.length,9),n=0;n<r;n++)e.words[n]=t.words[n];if(e.length=r,t.length<=9)return t.words[0]=0,void(t.length=1);var i=t.words[9];for(e.words[e.length++]=4194303&i,n=10;n<t.length;n++){var o=0|t.words[n];t.words[n-10]=(4194303&o)<<4|i>>>22,i=o}i>>>=22,t.words[n-10]=i,0===i&&t.length>10?t.length-=10:t.length-=9},g.prototype.imulK=function(t){t.words[t.length]=0,t.words[t.length+1]=0,t.length+=2;for(var e=0,r=0;r<t.length;r++){var n=0|t.words[r];e+=977*n,t.words[r]=67108863&e,e=64*n+(e/67108864|0)}return 0===t.words[t.length-1]&&(t.length--,0===t.words[t.length-1]&&t.length--),t},i(m,v),i(_,v),i(w,v),w.prototype.imulK=function(t){for(var e=0,r=0;r<t.length;r++){var n=19*(0|t.words[r])+e,i=67108863&n;n>>>=26,t.words[r]=i,e=n}return 0!==e&&(t.words[t.length++]=e),t},o._prime=function(t){if(y[t])return y[t];var e;if("k256"===t)e=new g;else if("p224"===t)e=new m;else if("p192"===t)e=new _;else{if("p25519"!==t)throw new Error("Unknown prime "+t);e=new w}return y[t]=e,e},S.prototype._verify1=function(t){n(0===t.negative,"red works only with positives"),n(t.red,"red works only with red numbers")},S.prototype._verify2=function(t,e){n(0==(t.negative|e.negative),"red works only with positives"),n(t.red&&t.red===e.red,"red works only with red numbers")},S.prototype.imod=function(t){return this.prime?this.prime.ireduce(t)._forceRed(this):t.umod(this.m)._forceRed(this)},S.prototype.neg=function(t){return t.isZero()?t.clone():this.m.sub(t)._forceRed(this)},S.prototype.add=function(t,e){this._verify2(t,e);var r=t.add(e);return r.cmp(this.m)>=0&&r.isub(this.m),r._forceRed(this)},S.prototype.iadd=function(t,e){this._verify2(t,e);var r=t.iadd(e);return r.cmp(this.m)>=0&&r.isub(this.m),r},S.prototype.sub=function(t,e){this._verify2(t,e);var r=t.sub(e);return r.cmpn(0)<0&&r.iadd(this.m),r._forceRed(this)},S.prototype.isub=function(t,e){this._verify2(t,e);var r=t.isub(e);return r.cmpn(0)<0&&r.iadd(this.m),r},S.prototype.shl=function(t,e){return this._verify1(t),this.imod(t.ushln(e))},S.prototype.imul=function(t,e){return this._verify2(t,e),this.imod(t.imul(e))},S.prototype.mul=function(t,e){return this._verify2(t,e),this.imod(t.mul(e))},S.prototype.isqr=function(t){return this.imul(t,t.clone())},S.prototype.sqr=function(t){return this.mul(t,t)},S.prototype.sqrt=function(t){if(t.isZero())return t.clone();var e=this.m.andln(3);if(n(e%2==1),3===e){var r=this.m.add(new o(1)).iushrn(2);return this.pow(t,r)}for(var i=this.m.subn(1),a=0;!i.isZero()&&0===i.andln(1);)a++,i.iushrn(1);n(!i.isZero());var f=new o(1).toRed(this),s=f.redNeg(),c=this.m.subn(1).iushrn(1),u=this.m.bitLength();for(u=new o(2*u*u).toRed(this);0!==this.pow(u,c).cmp(s);)u.redIAdd(s);for(var h=this.pow(u,i),d=this.pow(t,i.addn(1).iushrn(1)),l=this.pow(t,i),p=a;0!==l.cmp(f);){for(var b=l,y=0;0!==b.cmp(f);y++)b=b.redSqr();n(y<p);var v=this.pow(h,new o(1).iushln(p-y-1));d=d.redMul(v),h=v.redSqr(),l=l.redMul(h),p=y}return d},S.prototype.invm=function(t){var e=t._invmp(this.m);return 0!==e.negative?(e.negative=0,this.imod(e).redNeg()):this.imod(e)},S.prototype.pow=function(t,e){if(e.isZero())return new o(1).toRed(this);if(0===e.cmpn(1))return t.clone();var r=new Array(16);r[0]=new o(1).toRed(this),r[1]=t;for(var n=2;n<r.length;n++)r[n]=this.mul(r[n-1],t);var i=r[0],a=0,f=0,s=e.bitLength()%26;for(0===s&&(s=26),n=e.length-1;n>=0;n--){for(var c=e.words[n],u=s-1;u>=0;u--){var h=c>>u&1;i!==r[0]&&(i=this.sqr(i)),0!==h||0!==a?(a<<=1,a|=h,(4===++f||0===n&&0===u)&&(i=this.mul(i,r[a]),f=0,a=0)):f=0}s=26}return i},S.prototype.convertTo=function(t){var e=t.umod(this.m);return e===t?e.clone():e},S.prototype.convertFrom=function(t){var e=t.clone();return e.red=null,e},o.mont=function(t){return new E(t)},i(E,S),E.prototype.convertTo=function(t){return this.imod(t.ushln(this.shift))},E.prototype.convertFrom=function(t){var e=this.imod(t.mul(this.rinv));return e.red=null,e},E.prototype.imul=function(t,e){if(t.isZero()||e.isZero())return t.words[0]=0,t.length=1,t;var r=t.imul(e),n=r.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m),i=r.isub(n).iushrn(this.shift),o=i;return i.cmp(this.m)>=0?o=i.isub(this.m):i.cmpn(0)<0&&(o=i.iadd(this.m)),o._forceRed(this)},E.prototype.mul=function(t,e){if(t.isZero()||e.isZero())return new o(0)._forceRed(this);var r=t.mul(e),n=r.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m),i=r.isub(n).iushrn(this.shift),a=i;return i.cmp(this.m)>=0?a=i.isub(this.m):i.cmpn(0)<0&&(a=i.iadd(this.m)),a._forceRed(this)},E.prototype.invm=function(t){return this.imod(t._invmp(this.m).mul(this.r2))._forceRed(this)}}(void 0===t||t,this)}).call(this,r(22)(t))},function(t,e){var r;r=function(){return this}();try{r=r||Function("return this")()||(0,eval)("this")}catch(t){"object"==typeof window&&(r=window)}t.exports=r},function(t,e,r){"use strict";var n=r(8),i=r(0);function o(t){return(t>>>24|t>>>8&65280|t<<8&16711680|(255&t)<<24)>>>0}function a(t){return 1===t.length?"0"+t:t}function f(t){return 7===t.length?"0"+t:6===t.length?"00"+t:5===t.length?"000"+t:4===t.length?"0000"+t:3===t.length?"00000"+t:2===t.length?"000000"+t:1===t.length?"0000000"+t:t}e.inherits=i,e.toArray=function(t,e){if(Array.isArray(t))return t.slice();if(!t)return[];var r=[];if("string"==typeof t)if(e){if("hex"===e)for((t=t.replace(/[^a-z0-9]+/gi,"")).length%2!=0&&(t="0"+t),n=0;n<t.length;n+=2)r.push(parseInt(t[n]+t[n+1],16))}else for(var n=0;n<t.length;n++){var i=t.charCodeAt(n),o=i>>8,a=255&i;o?r.push(o,a):r.push(a)}else for(n=0;n<t.length;n++)r[n]=0|t[n];return r},e.toHex=function(t){for(var e="",r=0;r<t.length;r++)e+=a(t[r].toString(16));return e},e.htonl=o,e.toHex32=function(t,e){for(var r="",n=0;n<t.length;n++){var i=t[n];"little"===e&&(i=o(i)),r+=f(i.toString(16))}return r},e.zero2=a,e.zero8=f,e.join32=function(t,e,r,i){var o=r-e;n(o%4==0);for(var a=new Array(o/4),f=0,s=e;f<a.length;f++,s+=4){var c;c="big"===i?t[s]<<24|t[s+1]<<16|t[s+2]<<8|t[s+3]:t[s+3]<<24|t[s+2]<<16|t[s+1]<<8|t[s],a[f]=c>>>0}return a},e.split32=function(t,e){for(var r=new Array(4*t.length),n=0,i=0;n<t.length;n++,i+=4){var o=t[n];"big"===e?(r[i]=o>>>24,r[i+1]=o>>>16&255,r[i+2]=o>>>8&255,r[i+3]=255&o):(r[i+3]=o>>>24,r[i+2]=o>>>16&255,r[i+1]=o>>>8&255,r[i]=255&o)}return r},e.rotr32=function(t,e){return t>>>e|t<<32-e},e.rotl32=function(t,e){return t<<e|t>>>32-e},e.sum32=function(t,e){return t+e>>>0},e.sum32_3=function(t,e,r){return t+e+r>>>0},e.sum32_4=function(t,e,r,n){return t+e+r+n>>>0},e.sum32_5=function(t,e,r,n,i){return t+e+r+n+i>>>0},e.sum64=function(t,e,r,n){var i=t[e],o=n+t[e+1]>>>0,a=(o<n?1:0)+r+i;t[e]=a>>>0,t[e+1]=o},e.sum64_hi=function(t,e,r,n){return(e+n>>>0<e?1:0)+t+r>>>0},e.sum64_lo=function(t,e,r,n){return e+n>>>0},e.sum64_4_hi=function(t,e,r,n,i,o,a,f){var s=0,c=e;return s+=(c=c+n>>>0)<e?1:0,s+=(c=c+o>>>0)<o?1:0,t+r+i+a+(s+=(c=c+f>>>0)<f?1:0)>>>0},e.sum64_4_lo=function(t,e,r,n,i,o,a,f){return e+n+o+f>>>0},e.sum64_5_hi=function(t,e,r,n,i,o,a,f,s,c){var u=0,h=e;return u+=(h=h+n>>>0)<e?1:0,u+=(h=h+o>>>0)<o?1:0,u+=(h=h+f>>>0)<f?1:0,t+r+i+a+s+(u+=(h=h+c>>>0)<c?1:0)>>>0},e.sum64_5_lo=function(t,e,r,n,i,o,a,f,s,c){return e+n+o+f+c>>>0},e.rotr64_hi=function(t,e,r){return(e<<32-r|t>>>r)>>>0},e.rotr64_lo=function(t,e,r){return(t<<32-r|e>>>r)>>>0},e.shr64_hi=function(t,e,r){return t>>>r},e.shr64_lo=function(t,e,r){return(t<<32-r|e>>>r)>>>0}},function(t,e){var r,n,i=t.exports={};function o(){throw new Error("setTimeout has not been defined")}function a(){throw new Error("clearTimeout has not been defined")}function f(t){if(r===setTimeout)return setTimeout(t,0);if((r===o||!r)&&setTimeout)return r=setTimeout,setTimeout(t,0);try{return r(t,0)}catch(e){try{return r.call(null,t,0)}catch(e){return r.call(this,t,0)}}}!function(){try{r="function"==typeof setTimeout?setTimeout:o}catch(t){r=o}try{n="function"==typeof clearTimeout?clearTimeout:a}catch(t){n=a}}();var s,c=[],u=!1,h=-1;function d(){u&&s&&(u=!1,s.length?c=s.concat(c):h=-1,c.length&&l())}function l(){if(!u){var t=f(d);u=!0;for(var e=c.length;e;){for(s=c,c=[];++h<e;)s&&s[h].run();h=-1,e=c.length}s=null,u=!1,function(t){if(n===clearTimeout)return clearTimeout(t);if((n===a||!n)&&clearTimeout)return n=clearTimeout,clearTimeout(t);try{n(t)}catch(e){try{return n.call(null,t)}catch(e){return n.call(this,t)}}}(t)}}function p(t,e){this.fun=t,this.array=e}function b(){}i.nextTick=function(t){var e=new Array(arguments.length-1);if(arguments.length>1)for(var r=1;r<arguments.length;r++)e[r-1]=arguments[r];c.push(new p(t,e)),1!==c.length||u||f(l)},p.prototype.run=function(){this.fun.apply(null,this.array)},i.title="browser",i.browser=!0,i.env={},i.argv=[],i.version="",i.versions={},i.on=b,i.addListener=b,i.once=b,i.off=b,i.removeListener=b,i.removeAllListeners=b,i.emit=b,i.prependListener=b,i.prependOnceListener=b,i.listeners=function(t){return[]},i.binding=function(t){throw new Error("process.binding is not supported")},i.cwd=function(){return"/"},i.chdir=function(t){throw new Error("process.chdir is not supported")},i.umask=function(){return 0}},function(t,e,r){"use strict";var n=r(17),i=Object.keys||function(t){var e=[];for(var r in t)e.push(r);return e};t.exports=h;var o=r(12);o.inherits=r(0);var a=r(31),f=r(20);o.inherits(h,a);for(var s=i(f.prototype),c=0;c<s.length;c++){var u=s[c];h.prototype[u]||(h.prototype[u]=f.prototype[u])}function h(t){if(!(this instanceof h))return new h(t);a.call(this,t),f.call(this,t),t&&!1===t.readable&&(this.readable=!1),t&&!1===t.writable&&(this.writable=!1),this.allowHalfOpen=!0,t&&!1===t.allowHalfOpen&&(this.allowHalfOpen=!1),this.once("end",d)}function d(){this.allowHalfOpen||this._writableState.ended||n.nextTick(l,this)}function l(t){t.end()}Object.defineProperty(h.prototype,"writableHighWaterMark",{enumerable:!1,get:function(){return this._writableState.highWaterMark}}),Object.defineProperty(h.prototype,"destroyed",{get:function(){return void 0!==this._readableState&&void 0!==this._writableState&&(this._readableState.destroyed&&this._writableState.destroyed)},set:function(t){void 0!==this._readableState&&void 0!==this._writableState&&(this._readableState.destroyed=t,this._writableState.destroyed=t)}}),h.prototype._destroy=function(t,e){this.push(null),this.end(),n.nextTick(e,t)}},function(t,e){function r(t,e){if(!t)throw new Error(e||"Assertion failed")}t.exports=r,r.equal=function(t,e,r){if(t!=e)throw new Error(r||"Assertion failed: "+t+" != "+e)}},function(t,e){function r(){this._events=this._events||{},this._maxListeners=this._maxListeners||void 0}function n(t){return"function"==typeof t}function i(t){return"object"==typeof t&&null!==t}function o(t){return void 0===t}t.exports=r,r.EventEmitter=r,r.prototype._events=void 0,r.prototype._maxListeners=void 0,r.defaultMaxListeners=10,r.prototype.setMaxListeners=function(t){if(!function(t){return"number"==typeof t}(t)||t<0||isNaN(t))throw TypeError("n must be a positive number");return this._maxListeners=t,this},r.prototype.emit=function(t){var e,r,a,f,s,c;if(this._events||(this._events={}),"error"===t&&(!this._events.error||i(this._events.error)&&!this._events.error.length)){if((e=arguments[1])instanceof Error)throw e;var u=new Error('Uncaught, unspecified "error" event. ('+e+")");throw u.context=e,u}if(o(r=this._events[t]))return!1;if(n(r))switch(arguments.length){case 1:r.call(this);break;case 2:r.call(this,arguments[1]);break;case 3:r.call(this,arguments[1],arguments[2]);break;default:f=Array.prototype.slice.call(arguments,1),r.apply(this,f)}else if(i(r))for(f=Array.prototype.slice.call(arguments,1),a=(c=r.slice()).length,s=0;s<a;s++)c[s].apply(this,f);return!0},r.prototype.addListener=function(t,e){var a;if(!n(e))throw TypeError("listener must be a function");return this._events||(this._events={}),this._events.newListener&&this.emit("newListener",t,n(e.listener)?e.listener:e),this._events[t]?i(this._events[t])?this._events[t].push(e):this._events[t]=[this._events[t],e]:this._events[t]=e,i(this._events[t])&&!this._events[t].warned&&(a=o(this._maxListeners)?r.defaultMaxListeners:this._maxListeners)&&a>0&&this._events[t].length>a&&(this._events[t].warned=!0,console.error("(node) warning: possible EventEmitter memory leak detected. %d listeners added. Use emitter.setMaxListeners() to increase limit.",this._events[t].length),"function"==typeof console.trace&&console.trace()),this},r.prototype.on=r.prototype.addListener,r.prototype.once=function(t,e){if(!n(e))throw TypeError("listener must be a function");var r=!1;function i(){this.removeListener(t,i),r||(r=!0,e.apply(this,arguments))}return i.listener=e,this.on(t,i),this},r.prototype.removeListener=function(t,e){var r,o,a,f;if(!n(e))throw TypeError("listener must be a function");if(!this._events||!this._events[t])return this;if(a=(r=this._events[t]).length,o=-1,r===e||n(r.listener)&&r.listener===e)delete this._events[t],this._events.removeListener&&this.emit("removeListener",t,e);else if(i(r)){for(f=a;f-- >0;)if(r[f]===e||r[f].listener&&r[f].listener===e){o=f;break}if(o<0)return this;1===r.length?(r.length=0,delete this._events[t]):r.splice(o,1),this._events.removeListener&&this.emit("removeListener",t,e)}return this},r.prototype.removeAllListeners=function(t){var e,r;if(!this._events)return this;if(!this._events.removeListener)return 0===arguments.length?this._events={}:this._events[t]&&delete this._events[t],this;if(0===arguments.length){for(e in this._events)"removeListener"!==e&&this.removeAllListeners(e);return this.removeAllListeners("removeListener"),this._events={},this}if(n(r=this._events[t]))this.removeListener(t,r);else if(r)for(;r.length;)this.removeListener(t,r[r.length-1]);return delete this._events[t],this},r.prototype.listeners=function(t){return this._events&&this._events[t]?n(this._events[t])?[this._events[t]]:this._events[t].slice():[]},r.prototype.listenerCount=function(t){if(this._events){var e=this._events[t];if(n(e))return 1;if(e)return e.length}return 0},r.listenerCount=function(t,e){return t.listenerCount(e)}},function(t,e,r){var n=r(1).Buffer;function i(t,e){this._block=n.alloc(t),this._finalSize=e,this._blockSize=t,this._len=0}i.prototype.update=function(t,e){"string"==typeof t&&(e=e||"utf8",t=n.from(t,e));for(var r=this._block,i=this._blockSize,o=t.length,a=this._len,f=0;f<o;){for(var s=a%i,c=Math.min(o-f,i-s),u=0;u<c;u++)r[s+u]=t[f+u];f+=c,(a+=c)%i==0&&this._update(r)}return this._len+=o,this},i.prototype.digest=function(t){var e=this._len%this._blockSize;this._block[e]=128,this._block.fill(0,e+1),e>=this._finalSize&&(this._update(this._block),this._block.fill(0));var r=8*this._len;if(r<=4294967295)this._block.writeUInt32BE(r,this._blockSize-4);else{var n=(4294967295&r)>>>0,i=(r-n)/4294967296;this._block.writeUInt32BE(i,this._blockSize-8),this._block.writeUInt32BE(n,this._blockSize-4)}this._update(this._block);var o=this._hash();return t?o.toString(t):o},i.prototype._update=function(){throw new Error("_update must be implemented by subclass")},t.exports=i},function(t,e,r){"use strict";(function(t){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
var n=r(69),i=r(70),o=r(30);function a(){return s.TYPED_ARRAY_SUPPORT?2147483647:1073741823}function f(t,e){if(a()<e)throw new RangeError("Invalid typed array length");return s.TYPED_ARRAY_SUPPORT?(t=new Uint8Array(e)).__proto__=s.prototype:(null===t&&(t=new s(e)),t.length=e),t}function s(t,e,r){if(!(s.TYPED_ARRAY_SUPPORT||this instanceof s))return new s(t,e,r);if("number"==typeof t){if("string"==typeof e)throw new Error("If encoding is specified then the first argument must be a string");return h(this,t)}return c(this,t,e,r)}function c(t,e,r,n){if("number"==typeof e)throw new TypeError('"value" argument must not be a number');return"undefined"!=typeof ArrayBuffer&&e instanceof ArrayBuffer?function(t,e,r,n){if(e.byteLength,r<0||e.byteLength<r)throw new RangeError("'offset' is out of bounds");if(e.byteLength<r+(n||0))throw new RangeError("'length' is out of bounds");e=void 0===r&&void 0===n?new Uint8Array(e):void 0===n?new Uint8Array(e,r):new Uint8Array(e,r,n);s.TYPED_ARRAY_SUPPORT?(t=e).__proto__=s.prototype:t=d(t,e);return t}(t,e,r,n):"string"==typeof e?function(t,e,r){"string"==typeof r&&""!==r||(r="utf8");if(!s.isEncoding(r))throw new TypeError('"encoding" must be a valid string encoding');var n=0|p(e,r),i=(t=f(t,n)).write(e,r);i!==n&&(t=t.slice(0,i));return t}(t,e,r):function(t,e){if(s.isBuffer(e)){var r=0|l(e.length);return 0===(t=f(t,r)).length?t:(e.copy(t,0,0,r),t)}if(e){if("undefined"!=typeof ArrayBuffer&&e.buffer instanceof ArrayBuffer||"length"in e)return"number"!=typeof e.length||function(t){return t!=t}(e.length)?f(t,0):d(t,e);if("Buffer"===e.type&&o(e.data))return d(t,e.data)}throw new TypeError("First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.")}(t,e)}function u(t){if("number"!=typeof t)throw new TypeError('"size" argument must be a number');if(t<0)throw new RangeError('"size" argument must not be negative')}function h(t,e){if(u(e),t=f(t,e<0?0:0|l(e)),!s.TYPED_ARRAY_SUPPORT)for(var r=0;r<e;++r)t[r]=0;return t}function d(t,e){var r=e.length<0?0:0|l(e.length);t=f(t,r);for(var n=0;n<r;n+=1)t[n]=255&e[n];return t}function l(t){if(t>=a())throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x"+a().toString(16)+" bytes");return 0|t}function p(t,e){if(s.isBuffer(t))return t.length;if("undefined"!=typeof ArrayBuffer&&"function"==typeof ArrayBuffer.isView&&(ArrayBuffer.isView(t)||t instanceof ArrayBuffer))return t.byteLength;"string"!=typeof t&&(t=""+t);var r=t.length;if(0===r)return 0;for(var n=!1;;)switch(e){case"ascii":case"latin1":case"binary":return r;case"utf8":case"utf-8":case void 0:return q(t).length;case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return 2*r;case"hex":return r>>>1;case"base64":return z(t).length;default:if(n)return q(t).length;e=(""+e).toLowerCase(),n=!0}}function b(t,e,r){var n=t[e];t[e]=t[r],t[r]=n}function y(t,e,r,n,i){if(0===t.length)return-1;if("string"==typeof r?(n=r,r=0):r>2147483647?r=2147483647:r<-2147483648&&(r=-2147483648),r=+r,isNaN(r)&&(r=i?0:t.length-1),r<0&&(r=t.length+r),r>=t.length){if(i)return-1;r=t.length-1}else if(r<0){if(!i)return-1;r=0}if("string"==typeof e&&(e=s.from(e,n)),s.isBuffer(e))return 0===e.length?-1:v(t,e,r,n,i);if("number"==typeof e)return e&=255,s.TYPED_ARRAY_SUPPORT&&"function"==typeof Uint8Array.prototype.indexOf?i?Uint8Array.prototype.indexOf.call(t,e,r):Uint8Array.prototype.lastIndexOf.call(t,e,r):v(t,[e],r,n,i);throw new TypeError("val must be string, number or Buffer")}function v(t,e,r,n,i){var o,a=1,f=t.length,s=e.length;if(void 0!==n&&("ucs2"===(n=String(n).toLowerCase())||"ucs-2"===n||"utf16le"===n||"utf-16le"===n)){if(t.length<2||e.length<2)return-1;a=2,f/=2,s/=2,r/=2}function c(t,e){return 1===a?t[e]:t.readUInt16BE(e*a)}if(i){var u=-1;for(o=r;o<f;o++)if(c(t,o)===c(e,-1===u?0:o-u)){if(-1===u&&(u=o),o-u+1===s)return u*a}else-1!==u&&(o-=o-u),u=-1}else for(r+s>f&&(r=f-s),o=r;o>=0;o--){for(var h=!0,d=0;d<s;d++)if(c(t,o+d)!==c(e,d)){h=!1;break}if(h)return o}return-1}function g(t,e,r,n){r=Number(r)||0;var i=t.length-r;n?(n=Number(n))>i&&(n=i):n=i;var o=e.length;if(o%2!=0)throw new TypeError("Invalid hex string");n>o/2&&(n=o/2);for(var a=0;a<n;++a){var f=parseInt(e.substr(2*a,2),16);if(isNaN(f))return a;t[r+a]=f}return a}function m(t,e,r,n){return F(q(e,t.length-r),t,r,n)}function _(t,e,r,n){return F(function(t){for(var e=[],r=0;r<t.length;++r)e.push(255&t.charCodeAt(r));return e}(e),t,r,n)}function w(t,e,r,n){return _(t,e,r,n)}function S(t,e,r,n){return F(z(e),t,r,n)}function E(t,e,r,n){return F(function(t,e){for(var r,n,i,o=[],a=0;a<t.length&&!((e-=2)<0);++a)r=t.charCodeAt(a),n=r>>8,i=r%256,o.push(i),o.push(n);return o}(e,t.length-r),t,r,n)}function M(t,e,r){return 0===e&&r===t.length?n.fromByteArray(t):n.fromByteArray(t.slice(e,r))}function A(t,e,r){r=Math.min(t.length,r);for(var n=[],i=e;i<r;){var o,a,f,s,c=t[i],u=null,h=c>239?4:c>223?3:c>191?2:1;if(i+h<=r)switch(h){case 1:c<128&&(u=c);break;case 2:128==(192&(o=t[i+1]))&&(s=(31&c)<<6|63&o)>127&&(u=s);break;case 3:o=t[i+1],a=t[i+2],128==(192&o)&&128==(192&a)&&(s=(15&c)<<12|(63&o)<<6|63&a)>2047&&(s<55296||s>57343)&&(u=s);break;case 4:o=t[i+1],a=t[i+2],f=t[i+3],128==(192&o)&&128==(192&a)&&128==(192&f)&&(s=(15&c)<<18|(63&o)<<12|(63&a)<<6|63&f)>65535&&s<1114112&&(u=s)}null===u?(u=65533,h=1):u>65535&&(u-=65536,n.push(u>>>10&1023|55296),u=56320|1023&u),n.push(u),i+=h}return function(t){var e=t.length;if(e<=x)return String.fromCharCode.apply(String,t);var r="",n=0;for(;n<e;)r+=String.fromCharCode.apply(String,t.slice(n,n+=x));return r}(n)}e.Buffer=s,e.SlowBuffer=function(t){+t!=t&&(t=0);return s.alloc(+t)},e.INSPECT_MAX_BYTES=50,s.TYPED_ARRAY_SUPPORT=void 0!==t.TYPED_ARRAY_SUPPORT?t.TYPED_ARRAY_SUPPORT:function(){try{var t=new Uint8Array(1);return t.__proto__={__proto__:Uint8Array.prototype,foo:function(){return 42}},42===t.foo()&&"function"==typeof t.subarray&&0===t.subarray(1,1).byteLength}catch(t){return!1}}(),e.kMaxLength=a(),s.poolSize=8192,s._augment=function(t){return t.__proto__=s.prototype,t},s.from=function(t,e,r){return c(null,t,e,r)},s.TYPED_ARRAY_SUPPORT&&(s.prototype.__proto__=Uint8Array.prototype,s.__proto__=Uint8Array,"undefined"!=typeof Symbol&&Symbol.species&&s[Symbol.species]===s&&Object.defineProperty(s,Symbol.species,{value:null,configurable:!0})),s.alloc=function(t,e,r){return function(t,e,r,n){return u(e),e<=0?f(t,e):void 0!==r?"string"==typeof n?f(t,e).fill(r,n):f(t,e).fill(r):f(t,e)}(null,t,e,r)},s.allocUnsafe=function(t){return h(null,t)},s.allocUnsafeSlow=function(t){return h(null,t)},s.isBuffer=function(t){return!(null==t||!t._isBuffer)},s.compare=function(t,e){if(!s.isBuffer(t)||!s.isBuffer(e))throw new TypeError("Arguments must be Buffers");if(t===e)return 0;for(var r=t.length,n=e.length,i=0,o=Math.min(r,n);i<o;++i)if(t[i]!==e[i]){r=t[i],n=e[i];break}return r<n?-1:n<r?1:0},s.isEncoding=function(t){switch(String(t).toLowerCase()){case"hex":case"utf8":case"utf-8":case"ascii":case"latin1":case"binary":case"base64":case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return!0;default:return!1}},s.concat=function(t,e){if(!o(t))throw new TypeError('"list" argument must be an Array of Buffers');if(0===t.length)return s.alloc(0);var r;if(void 0===e)for(e=0,r=0;r<t.length;++r)e+=t[r].length;var n=s.allocUnsafe(e),i=0;for(r=0;r<t.length;++r){var a=t[r];if(!s.isBuffer(a))throw new TypeError('"list" argument must be an Array of Buffers');a.copy(n,i),i+=a.length}return n},s.byteLength=p,s.prototype._isBuffer=!0,s.prototype.swap16=function(){var t=this.length;if(t%2!=0)throw new RangeError("Buffer size must be a multiple of 16-bits");for(var e=0;e<t;e+=2)b(this,e,e+1);return this},s.prototype.swap32=function(){var t=this.length;if(t%4!=0)throw new RangeError("Buffer size must be a multiple of 32-bits");for(var e=0;e<t;e+=4)b(this,e,e+3),b(this,e+1,e+2);return this},s.prototype.swap64=function(){var t=this.length;if(t%8!=0)throw new RangeError("Buffer size must be a multiple of 64-bits");for(var e=0;e<t;e+=8)b(this,e,e+7),b(this,e+1,e+6),b(this,e+2,e+5),b(this,e+3,e+4);return this},s.prototype.toString=function(){var t=0|this.length;return 0===t?"":0===arguments.length?A(this,0,t):function(t,e,r){var n=!1;if((void 0===e||e<0)&&(e=0),e>this.length)return"";if((void 0===r||r>this.length)&&(r=this.length),r<=0)return"";if((r>>>=0)<=(e>>>=0))return"";for(t||(t="utf8");;)switch(t){case"hex":return B(this,e,r);case"utf8":case"utf-8":return A(this,e,r);case"ascii":return k(this,e,r);case"latin1":case"binary":return I(this,e,r);case"base64":return M(this,e,r);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return R(this,e,r);default:if(n)throw new TypeError("Unknown encoding: "+t);t=(t+"").toLowerCase(),n=!0}}.apply(this,arguments)},s.prototype.equals=function(t){if(!s.isBuffer(t))throw new TypeError("Argument must be a Buffer");return this===t||0===s.compare(this,t)},s.prototype.inspect=function(){var t="",r=e.INSPECT_MAX_BYTES;return this.length>0&&(t=this.toString("hex",0,r).match(/.{2}/g).join(" "),this.length>r&&(t+=" ... ")),"<Buffer "+t+">"},s.prototype.compare=function(t,e,r,n,i){if(!s.isBuffer(t))throw new TypeError("Argument must be a Buffer");if(void 0===e&&(e=0),void 0===r&&(r=t?t.length:0),void 0===n&&(n=0),void 0===i&&(i=this.length),e<0||r>t.length||n<0||i>this.length)throw new RangeError("out of range index");if(n>=i&&e>=r)return 0;if(n>=i)return-1;if(e>=r)return 1;if(e>>>=0,r>>>=0,n>>>=0,i>>>=0,this===t)return 0;for(var o=i-n,a=r-e,f=Math.min(o,a),c=this.slice(n,i),u=t.slice(e,r),h=0;h<f;++h)if(c[h]!==u[h]){o=c[h],a=u[h];break}return o<a?-1:a<o?1:0},s.prototype.includes=function(t,e,r){return-1!==this.indexOf(t,e,r)},s.prototype.indexOf=function(t,e,r){return y(this,t,e,r,!0)},s.prototype.lastIndexOf=function(t,e,r){return y(this,t,e,r,!1)},s.prototype.write=function(t,e,r,n){if(void 0===e)n="utf8",r=this.length,e=0;else if(void 0===r&&"string"==typeof e)n=e,r=this.length,e=0;else{if(!isFinite(e))throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");e|=0,isFinite(r)?(r|=0,void 0===n&&(n="utf8")):(n=r,r=void 0)}var i=this.length-e;if((void 0===r||r>i)&&(r=i),t.length>0&&(r<0||e<0)||e>this.length)throw new RangeError("Attempt to write outside buffer bounds");n||(n="utf8");for(var o=!1;;)switch(n){case"hex":return g(this,t,e,r);case"utf8":case"utf-8":return m(this,t,e,r);case"ascii":return _(this,t,e,r);case"latin1":case"binary":return w(this,t,e,r);case"base64":return S(this,t,e,r);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return E(this,t,e,r);default:if(o)throw new TypeError("Unknown encoding: "+n);n=(""+n).toLowerCase(),o=!0}},s.prototype.toJSON=function(){return{type:"Buffer",data:Array.prototype.slice.call(this._arr||this,0)}};var x=4096;function k(t,e,r){var n="";r=Math.min(t.length,r);for(var i=e;i<r;++i)n+=String.fromCharCode(127&t[i]);return n}function I(t,e,r){var n="";r=Math.min(t.length,r);for(var i=e;i<r;++i)n+=String.fromCharCode(t[i]);return n}function B(t,e,r){var n=t.length;(!e||e<0)&&(e=0),(!r||r<0||r>n)&&(r=n);for(var i="",o=e;o<r;++o)i+=U(t[o]);return i}function R(t,e,r){for(var n=t.slice(e,r),i="",o=0;o<n.length;o+=2)i+=String.fromCharCode(n[o]+256*n[o+1]);return i}function P(t,e,r){if(t%1!=0||t<0)throw new RangeError("offset is not uint");if(t+e>r)throw new RangeError("Trying to access beyond buffer length")}function T(t,e,r,n,i,o){if(!s.isBuffer(t))throw new TypeError('"buffer" argument must be a Buffer instance');if(e>i||e<o)throw new RangeError('"value" argument is out of bounds');if(r+n>t.length)throw new RangeError("Index out of range")}function L(t,e,r,n){e<0&&(e=65535+e+1);for(var i=0,o=Math.min(t.length-r,2);i<o;++i)t[r+i]=(e&255<<8*(n?i:1-i))>>>8*(n?i:1-i)}function O(t,e,r,n){e<0&&(e=4294967295+e+1);for(var i=0,o=Math.min(t.length-r,4);i<o;++i)t[r+i]=e>>>8*(n?i:3-i)&255}function C(t,e,r,n,i,o){if(r+n>t.length)throw new RangeError("Index out of range");if(r<0)throw new RangeError("Index out of range")}function j(t,e,r,n,o){return o||C(t,0,r,4),i.write(t,e,r,n,23,4),r+4}function N(t,e,r,n,o){return o||C(t,0,r,8),i.write(t,e,r,n,52,8),r+8}s.prototype.slice=function(t,e){var r,n=this.length;if(t=~~t,e=void 0===e?n:~~e,t<0?(t+=n)<0&&(t=0):t>n&&(t=n),e<0?(e+=n)<0&&(e=0):e>n&&(e=n),e<t&&(e=t),s.TYPED_ARRAY_SUPPORT)(r=this.subarray(t,e)).__proto__=s.prototype;else{var i=e-t;r=new s(i,void 0);for(var o=0;o<i;++o)r[o]=this[o+t]}return r},s.prototype.readUIntLE=function(t,e,r){t|=0,e|=0,r||P(t,e,this.length);for(var n=this[t],i=1,o=0;++o<e&&(i*=256);)n+=this[t+o]*i;return n},s.prototype.readUIntBE=function(t,e,r){t|=0,e|=0,r||P(t,e,this.length);for(var n=this[t+--e],i=1;e>0&&(i*=256);)n+=this[t+--e]*i;return n},s.prototype.readUInt8=function(t,e){return e||P(t,1,this.length),this[t]},s.prototype.readUInt16LE=function(t,e){return e||P(t,2,this.length),this[t]|this[t+1]<<8},s.prototype.readUInt16BE=function(t,e){return e||P(t,2,this.length),this[t]<<8|this[t+1]},s.prototype.readUInt32LE=function(t,e){return e||P(t,4,this.length),(this[t]|this[t+1]<<8|this[t+2]<<16)+16777216*this[t+3]},s.prototype.readUInt32BE=function(t,e){return e||P(t,4,this.length),16777216*this[t]+(this[t+1]<<16|this[t+2]<<8|this[t+3])},s.prototype.readIntLE=function(t,e,r){t|=0,e|=0,r||P(t,e,this.length);for(var n=this[t],i=1,o=0;++o<e&&(i*=256);)n+=this[t+o]*i;return n>=(i*=128)&&(n-=Math.pow(2,8*e)),n},s.prototype.readIntBE=function(t,e,r){t|=0,e|=0,r||P(t,e,this.length);for(var n=e,i=1,o=this[t+--n];n>0&&(i*=256);)o+=this[t+--n]*i;return o>=(i*=128)&&(o-=Math.pow(2,8*e)),o},s.prototype.readInt8=function(t,e){return e||P(t,1,this.length),128&this[t]?-1*(255-this[t]+1):this[t]},s.prototype.readInt16LE=function(t,e){e||P(t,2,this.length);var r=this[t]|this[t+1]<<8;return 32768&r?4294901760|r:r},s.prototype.readInt16BE=function(t,e){e||P(t,2,this.length);var r=this[t+1]|this[t]<<8;return 32768&r?4294901760|r:r},s.prototype.readInt32LE=function(t,e){return e||P(t,4,this.length),this[t]|this[t+1]<<8|this[t+2]<<16|this[t+3]<<24},s.prototype.readInt32BE=function(t,e){return e||P(t,4,this.length),this[t]<<24|this[t+1]<<16|this[t+2]<<8|this[t+3]},s.prototype.readFloatLE=function(t,e){return e||P(t,4,this.length),i.read(this,t,!0,23,4)},s.prototype.readFloatBE=function(t,e){return e||P(t,4,this.length),i.read(this,t,!1,23,4)},s.prototype.readDoubleLE=function(t,e){return e||P(t,8,this.length),i.read(this,t,!0,52,8)},s.prototype.readDoubleBE=function(t,e){return e||P(t,8,this.length),i.read(this,t,!1,52,8)},s.prototype.writeUIntLE=function(t,e,r,n){(t=+t,e|=0,r|=0,n)||T(this,t,e,r,Math.pow(2,8*r)-1,0);var i=1,o=0;for(this[e]=255&t;++o<r&&(i*=256);)this[e+o]=t/i&255;return e+r},s.prototype.writeUIntBE=function(t,e,r,n){(t=+t,e|=0,r|=0,n)||T(this,t,e,r,Math.pow(2,8*r)-1,0);var i=r-1,o=1;for(this[e+i]=255&t;--i>=0&&(o*=256);)this[e+i]=t/o&255;return e+r},s.prototype.writeUInt8=function(t,e,r){return t=+t,e|=0,r||T(this,t,e,1,255,0),s.TYPED_ARRAY_SUPPORT||(t=Math.floor(t)),this[e]=255&t,e+1},s.prototype.writeUInt16LE=function(t,e,r){return t=+t,e|=0,r||T(this,t,e,2,65535,0),s.TYPED_ARRAY_SUPPORT?(this[e]=255&t,this[e+1]=t>>>8):L(this,t,e,!0),e+2},s.prototype.writeUInt16BE=function(t,e,r){return t=+t,e|=0,r||T(this,t,e,2,65535,0),s.TYPED_ARRAY_SUPPORT?(this[e]=t>>>8,this[e+1]=255&t):L(this,t,e,!1),e+2},s.prototype.writeUInt32LE=function(t,e,r){return t=+t,e|=0,r||T(this,t,e,4,4294967295,0),s.TYPED_ARRAY_SUPPORT?(this[e+3]=t>>>24,this[e+2]=t>>>16,this[e+1]=t>>>8,this[e]=255&t):O(this,t,e,!0),e+4},s.prototype.writeUInt32BE=function(t,e,r){return t=+t,e|=0,r||T(this,t,e,4,4294967295,0),s.TYPED_ARRAY_SUPPORT?(this[e]=t>>>24,this[e+1]=t>>>16,this[e+2]=t>>>8,this[e+3]=255&t):O(this,t,e,!1),e+4},s.prototype.writeIntLE=function(t,e,r,n){if(t=+t,e|=0,!n){var i=Math.pow(2,8*r-1);T(this,t,e,r,i-1,-i)}var o=0,a=1,f=0;for(this[e]=255&t;++o<r&&(a*=256);)t<0&&0===f&&0!==this[e+o-1]&&(f=1),this[e+o]=(t/a>>0)-f&255;return e+r},s.prototype.writeIntBE=function(t,e,r,n){if(t=+t,e|=0,!n){var i=Math.pow(2,8*r-1);T(this,t,e,r,i-1,-i)}var o=r-1,a=1,f=0;for(this[e+o]=255&t;--o>=0&&(a*=256);)t<0&&0===f&&0!==this[e+o+1]&&(f=1),this[e+o]=(t/a>>0)-f&255;return e+r},s.prototype.writeInt8=function(t,e,r){return t=+t,e|=0,r||T(this,t,e,1,127,-128),s.TYPED_ARRAY_SUPPORT||(t=Math.floor(t)),t<0&&(t=255+t+1),this[e]=255&t,e+1},s.prototype.writeInt16LE=function(t,e,r){return t=+t,e|=0,r||T(this,t,e,2,32767,-32768),s.TYPED_ARRAY_SUPPORT?(this[e]=255&t,this[e+1]=t>>>8):L(this,t,e,!0),e+2},s.prototype.writeInt16BE=function(t,e,r){return t=+t,e|=0,r||T(this,t,e,2,32767,-32768),s.TYPED_ARRAY_SUPPORT?(this[e]=t>>>8,this[e+1]=255&t):L(this,t,e,!1),e+2},s.prototype.writeInt32LE=function(t,e,r){return t=+t,e|=0,r||T(this,t,e,4,2147483647,-2147483648),s.TYPED_ARRAY_SUPPORT?(this[e]=255&t,this[e+1]=t>>>8,this[e+2]=t>>>16,this[e+3]=t>>>24):O(this,t,e,!0),e+4},s.prototype.writeInt32BE=function(t,e,r){return t=+t,e|=0,r||T(this,t,e,4,2147483647,-2147483648),t<0&&(t=4294967295+t+1),s.TYPED_ARRAY_SUPPORT?(this[e]=t>>>24,this[e+1]=t>>>16,this[e+2]=t>>>8,this[e+3]=255&t):O(this,t,e,!1),e+4},s.prototype.writeFloatLE=function(t,e,r){return j(this,t,e,!0,r)},s.prototype.writeFloatBE=function(t,e,r){return j(this,t,e,!1,r)},s.prototype.writeDoubleLE=function(t,e,r){return N(this,t,e,!0,r)},s.prototype.writeDoubleBE=function(t,e,r){return N(this,t,e,!1,r)},s.prototype.copy=function(t,e,r,n){if(r||(r=0),n||0===n||(n=this.length),e>=t.length&&(e=t.length),e||(e=0),n>0&&n<r&&(n=r),n===r)return 0;if(0===t.length||0===this.length)return 0;if(e<0)throw new RangeError("targetStart out of bounds");if(r<0||r>=this.length)throw new RangeError("sourceStart out of bounds");if(n<0)throw new RangeError("sourceEnd out of bounds");n>this.length&&(n=this.length),t.length-e<n-r&&(n=t.length-e+r);var i,o=n-r;if(this===t&&r<e&&e<n)for(i=o-1;i>=0;--i)t[i+e]=this[i+r];else if(o<1e3||!s.TYPED_ARRAY_SUPPORT)for(i=0;i<o;++i)t[i+e]=this[i+r];else Uint8Array.prototype.set.call(t,this.subarray(r,r+o),e);return o},s.prototype.fill=function(t,e,r,n){if("string"==typeof t){if("string"==typeof e?(n=e,e=0,r=this.length):"string"==typeof r&&(n=r,r=this.length),1===t.length){var i=t.charCodeAt(0);i<256&&(t=i)}if(void 0!==n&&"string"!=typeof n)throw new TypeError("encoding must be a string");if("string"==typeof n&&!s.isEncoding(n))throw new TypeError("Unknown encoding: "+n)}else"number"==typeof t&&(t&=255);if(e<0||this.length<e||this.length<r)throw new RangeError("Out of range index");if(r<=e)return this;var o;if(e>>>=0,r=void 0===r?this.length:r>>>0,t||(t=0),"number"==typeof t)for(o=e;o<r;++o)this[o]=t;else{var a=s.isBuffer(t)?t:q(new s(t,n).toString()),f=a.length;for(o=0;o<r-e;++o)this[o+e]=a[o%f]}return this};var D=/[^+\/0-9A-Za-z-_]/g;function U(t){return t<16?"0"+t.toString(16):t.toString(16)}function q(t,e){var r;e=e||1/0;for(var n=t.length,i=null,o=[],a=0;a<n;++a){if((r=t.charCodeAt(a))>55295&&r<57344){if(!i){if(r>56319){(e-=3)>-1&&o.push(239,191,189);continue}if(a+1===n){(e-=3)>-1&&o.push(239,191,189);continue}i=r;continue}if(r<56320){(e-=3)>-1&&o.push(239,191,189),i=r;continue}r=65536+(i-55296<<10|r-56320)}else i&&(e-=3)>-1&&o.push(239,191,189);if(i=null,r<128){if((e-=1)<0)break;o.push(r)}else if(r<2048){if((e-=2)<0)break;o.push(r>>6|192,63&r|128)}else if(r<65536){if((e-=3)<0)break;o.push(r>>12|224,r>>6&63|128,63&r|128)}else{if(!(r<1114112))throw new Error("Invalid code point");if((e-=4)<0)break;o.push(r>>18|240,r>>12&63|128,r>>6&63|128,63&r|128)}}return o}function z(t){return n.toByteArray(function(t){if((t=function(t){return t.trim?t.trim():t.replace(/^\s+|\s+$/g,"")}(t).replace(D,"")).length<2)return"";for(;t.length%4!=0;)t+="=";return t}(t))}function F(t,e,r,n){for(var i=0;i<n&&!(i+r>=e.length||i>=t.length);++i)e[i+r]=t[i];return i}}).call(this,r(4))},function(t,e,r){(function(t){function r(t){return Object.prototype.toString.call(t)}e.isArray=function(t){return Array.isArray?Array.isArray(t):"[object Array]"===r(t)},e.isBoolean=function(t){return"boolean"==typeof t},e.isNull=function(t){return null===t},e.isNullOrUndefined=function(t){return null==t},e.isNumber=function(t){return"number"==typeof t},e.isString=function(t){return"string"==typeof t},e.isSymbol=function(t){return"symbol"==typeof t},e.isUndefined=function(t){return void 0===t},e.isRegExp=function(t){return"[object RegExp]"===r(t)},e.isObject=function(t){return"object"==typeof t&&null!==t},e.isDate=function(t){return"[object Date]"===r(t)},e.isError=function(t){return"[object Error]"===r(t)||t instanceof Error},e.isFunction=function(t){return"function"==typeof t},e.isPrimitive=function(t){return null===t||"boolean"==typeof t||"number"==typeof t||"string"==typeof t||"symbol"==typeof t||void 0===t},e.isBuffer=t.isBuffer}).call(this,r(11).Buffer)},function(t,e,r){"use strict";var n=r(5),i=r(8);function o(){this.pending=null,this.pendingTotal=0,this.blockSize=this.constructor.blockSize,this.outSize=this.constructor.outSize,this.hmacStrength=this.constructor.hmacStrength,this.padLength=this.constructor.padLength/8,this.endian="big",this._delta8=this.blockSize/8,this._delta32=this.blockSize/32}e.BlockHash=o,o.prototype.update=function(t,e){if(t=n.toArray(t,e),this.pending?this.pending=this.pending.concat(t):this.pending=t,this.pendingTotal+=t.length,this.pending.length>=this._delta8){var r=(t=this.pending).length%this._delta8;this.pending=t.slice(t.length-r,t.length),0===this.pending.length&&(this.pending=null),t=n.join32(t,0,t.length-r,this.endian);for(var i=0;i<t.length;i+=this._delta32)this._update(t,i,i+this._delta32)}return this},o.prototype.digest=function(t){return this.update(this._pad()),i(null===this.pending),this._digest(t)},o.prototype._pad=function(){var t=this.pendingTotal,e=this._delta8,r=e-(t+this.padLength)%e,n=new Array(r+this.padLength);n[0]=128;for(var i=1;i<r;i++)n[i]=0;if(t<<=3,"big"===this.endian){for(var o=8;o<this.padLength;o++)n[i++]=0;n[i++]=0,n[i++]=0,n[i++]=0,n[i++]=0,n[i++]=t>>>24&255,n[i++]=t>>>16&255,n[i++]=t>>>8&255,n[i++]=255&t}else for(n[i++]=255&t,n[i++]=t>>>8&255,n[i++]=t>>>16&255,n[i++]=t>>>24&255,n[i++]=0,n[i++]=0,n[i++]=0,n[i++]=0,o=8;o<this.padLength;o++)n[i++]=0;return n}},function(t,e,r){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.isAsync=void 0;var n=function(t){return t&&t.__esModule?t:{default:t}}(r(155));var i="function"==typeof Symbol;function o(t){return i&&"AsyncFunction"===t[Symbol.toStringTag]}e.default=function(t){return o(t)?(0,n.default)(t):t},e.isAsync=o},function(t,e,r){(function(t,n){var i=/%[sdj%]/g;e.format=function(t){if(!v(t)){for(var e=[],r=0;r<arguments.length;r++)e.push(f(arguments[r]));return e.join(" ")}r=1;for(var n=arguments,o=n.length,a=String(t).replace(i,function(t){if("%%"===t)return"%";if(r>=o)return t;switch(t){case"%s":return String(n[r++]);case"%d":return Number(n[r++]);case"%j":try{return JSON.stringify(n[r++])}catch(t){return"[Circular]"}default:return t}}),s=n[r];r<o;s=n[++r])b(s)||!_(s)?a+=" "+s:a+=" "+f(s);return a},e.deprecate=function(r,i){if(g(t.process))return function(){return e.deprecate(r,i).apply(this,arguments)};if(!0===n.noDeprecation)return r;var o=!1;return function(){if(!o){if(n.throwDeprecation)throw new Error(i);n.traceDeprecation?console.trace(i):console.error(i),o=!0}return r.apply(this,arguments)}};var o,a={};function f(t,r){var n={seen:[],stylize:c};return arguments.length>=3&&(n.depth=arguments[2]),arguments.length>=4&&(n.colors=arguments[3]),p(r)?n.showHidden=r:r&&e._extend(n,r),g(n.showHidden)&&(n.showHidden=!1),g(n.depth)&&(n.depth=2),g(n.colors)&&(n.colors=!1),g(n.customInspect)&&(n.customInspect=!0),n.colors&&(n.stylize=s),u(n,t,n.depth)}function s(t,e){var r=f.styles[e];return r?"["+f.colors[r][0]+"m"+t+"["+f.colors[r][1]+"m":t}function c(t,e){return t}function u(t,r,n){if(t.customInspect&&r&&E(r.inspect)&&r.inspect!==e.inspect&&(!r.constructor||r.constructor.prototype!==r)){var i=r.inspect(n,t);return v(i)||(i=u(t,i,n)),i}var o=function(t,e){if(g(e))return t.stylize("undefined","undefined");if(v(e)){var r="'"+JSON.stringify(e).replace(/^"|"$/g,"").replace(/'/g,"\\'").replace(/\\"/g,'"')+"'";return t.stylize(r,"string")}if(y(e))return t.stylize(""+e,"number");if(p(e))return t.stylize(""+e,"boolean");if(b(e))return t.stylize("null","null")}(t,r);if(o)return o;var a=Object.keys(r),f=function(t){var e={};return t.forEach(function(t,r){e[t]=!0}),e}(a);if(t.showHidden&&(a=Object.getOwnPropertyNames(r)),S(r)&&(a.indexOf("message")>=0||a.indexOf("description")>=0))return h(r);if(0===a.length){if(E(r)){var s=r.name?": "+r.name:"";return t.stylize("[Function"+s+"]","special")}if(m(r))return t.stylize(RegExp.prototype.toString.call(r),"regexp");if(w(r))return t.stylize(Date.prototype.toString.call(r),"date");if(S(r))return h(r)}var c,_="",M=!1,A=["{","}"];(l(r)&&(M=!0,A=["[","]"]),E(r))&&(_=" [Function"+(r.name?": "+r.name:"")+"]");return m(r)&&(_=" "+RegExp.prototype.toString.call(r)),w(r)&&(_=" "+Date.prototype.toUTCString.call(r)),S(r)&&(_=" "+h(r)),0!==a.length||M&&0!=r.length?n<0?m(r)?t.stylize(RegExp.prototype.toString.call(r),"regexp"):t.stylize("[Object]","special"):(t.seen.push(r),c=M?function(t,e,r,n,i){for(var o=[],a=0,f=e.length;a<f;++a)k(e,String(a))?o.push(d(t,e,r,n,String(a),!0)):o.push("");return i.forEach(function(i){i.match(/^\d+$/)||o.push(d(t,e,r,n,i,!0))}),o}(t,r,n,f,a):a.map(function(e){return d(t,r,n,f,e,M)}),t.seen.pop(),function(t,e,r){if(t.reduce(function(t,e){return 0,e.indexOf("\n")>=0&&0,t+e.replace(/\u001b\[\d\d?m/g,"").length+1},0)>60)return r[0]+(""===e?"":e+"\n ")+" "+t.join(",\n  ")+" "+r[1];return r[0]+e+" "+t.join(", ")+" "+r[1]}(c,_,A)):A[0]+_+A[1]}function h(t){return"["+Error.prototype.toString.call(t)+"]"}function d(t,e,r,n,i,o){var a,f,s;if((s=Object.getOwnPropertyDescriptor(e,i)||{value:e[i]}).get?f=s.set?t.stylize("[Getter/Setter]","special"):t.stylize("[Getter]","special"):s.set&&(f=t.stylize("[Setter]","special")),k(n,i)||(a="["+i+"]"),f||(t.seen.indexOf(s.value)<0?(f=b(r)?u(t,s.value,null):u(t,s.value,r-1)).indexOf("\n")>-1&&(f=o?f.split("\n").map(function(t){return"  "+t}).join("\n").substr(2):"\n"+f.split("\n").map(function(t){return"   "+t}).join("\n")):f=t.stylize("[Circular]","special")),g(a)){if(o&&i.match(/^\d+$/))return f;(a=JSON.stringify(""+i)).match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)?(a=a.substr(1,a.length-2),a=t.stylize(a,"name")):(a=a.replace(/'/g,"\\'").replace(/\\"/g,'"').replace(/(^"|"$)/g,"'"),a=t.stylize(a,"string"))}return a+": "+f}function l(t){return Array.isArray(t)}function p(t){return"boolean"==typeof t}function b(t){return null===t}function y(t){return"number"==typeof t}function v(t){return"string"==typeof t}function g(t){return void 0===t}function m(t){return _(t)&&"[object RegExp]"===M(t)}function _(t){return"object"==typeof t&&null!==t}function w(t){return _(t)&&"[object Date]"===M(t)}function S(t){return _(t)&&("[object Error]"===M(t)||t instanceof Error)}function E(t){return"function"==typeof t}function M(t){return Object.prototype.toString.call(t)}function A(t){return t<10?"0"+t.toString(10):t.toString(10)}e.debuglog=function(t){if(g(o)&&(o=n.env.NODE_DEBUG||""),t=t.toUpperCase(),!a[t])if(new RegExp("\\b"+t+"\\b","i").test(o)){var r=n.pid;a[t]=function(){var n=e.format.apply(e,arguments);console.error("%s %d: %s",t,r,n)}}else a[t]=function(){};return a[t]},e.inspect=f,f.colors={bold:[1,22],italic:[3,23],underline:[4,24],inverse:[7,27],white:[37,39],grey:[90,39],black:[30,39],blue:[34,39],cyan:[36,39],green:[32,39],magenta:[35,39],red:[31,39],yellow:[33,39]},f.styles={special:"cyan",number:"yellow",boolean:"yellow",undefined:"grey",null:"bold",string:"green",date:"magenta",regexp:"red"},e.isArray=l,e.isBoolean=p,e.isNull=b,e.isNullOrUndefined=function(t){return null==t},e.isNumber=y,e.isString=v,e.isSymbol=function(t){return"symbol"==typeof t},e.isUndefined=g,e.isRegExp=m,e.isObject=_,e.isDate=w,e.isError=S,e.isFunction=E,e.isPrimitive=function(t){return null===t||"boolean"==typeof t||"number"==typeof t||"string"==typeof t||"symbol"==typeof t||void 0===t},e.isBuffer=r(64);var x=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];function k(t,e){return Object.prototype.hasOwnProperty.call(t,e)}e.log=function(){console.log("%s - %s",function(){var t=new Date,e=[A(t.getHours()),A(t.getMinutes()),A(t.getSeconds())].join(":");return[t.getDate(),x[t.getMonth()],e].join(" ")}(),e.format.apply(e,arguments))},e.inherits=r(0),e._extend=function(t,e){if(!e||!_(e))return t;for(var r=Object.keys(e),n=r.length;n--;)t[r[n]]=e[r[n]];return t}}).call(this,r(4),r(6))},function(t,e,r){t.exports=i;var n=r(9).EventEmitter;function i(){n.call(this)}r(0)(i,n),i.Readable=r(19),i.Writable=r(77),i.Duplex=r(78),i.Transform=r(79),i.PassThrough=r(80),i.Stream=i,i.prototype.pipe=function(t,e){var r=this;function i(e){t.writable&&!1===t.write(e)&&r.pause&&r.pause()}function o(){r.readable&&r.resume&&r.resume()}r.on("data",i),t.on("drain",o),t._isStdio||e&&!1===e.end||(r.on("end",f),r.on("close",s));var a=!1;function f(){a||(a=!0,t.end())}function s(){a||(a=!0,"function"==typeof t.destroy&&t.destroy())}function c(t){if(u(),0===n.listenerCount(this,"error"))throw t}function u(){r.removeListener("data",i),t.removeListener("drain",o),r.removeListener("end",f),r.removeListener("close",s),r.removeListener("error",c),t.removeListener("error",c),r.removeListener("end",u),r.removeListener("close",u),t.removeListener("close",u)}return r.on("error",c),t.on("error",c),r.on("end",u),r.on("close",u),t.on("close",u),t.emit("pipe",r),t}},function(t,e,r){"use strict";(function(e){!e.version||0===e.version.indexOf("v0.")||0===e.version.indexOf("v1.")&&0!==e.version.indexOf("v1.8.")?t.exports={nextTick:function(t,r,n,i){if("function"!=typeof t)throw new TypeError('"callback" argument must be a function');var o,a,f=arguments.length;switch(f){case 0:case 1:return e.nextTick(t);case 2:return e.nextTick(function(){t.call(null,r)});case 3:return e.nextTick(function(){t.call(null,r,n)});case 4:return e.nextTick(function(){t.call(null,r,n,i)});default:for(o=new Array(f-1),a=0;a<o.length;)o[a++]=arguments[a];return e.nextTick(function(){t.apply(null,o)})}}}:t.exports=e}).call(this,r(6))},function(t,e,r){"use strict";var n=e;n.base=r(103),n.short=r(104),n.mont=r(105),n.edwards=r(106)},function(t,e,r){(e=t.exports=r(31)).Stream=e,e.Readable=e,e.Writable=r(20),e.Duplex=r(7),e.Transform=r(35),e.PassThrough=r(76)},function(t,e,r){"use strict";(function(e,n,i){var o=r(17);function a(t){var e=this;this.next=null,this.entry=null,this.finish=function(){!function(t,e,r){var n=t.entry;t.entry=null;for(;n;){var i=n.callback;e.pendingcb--,i(r),n=n.next}e.corkedRequestsFree?e.corkedRequestsFree.next=t:e.corkedRequestsFree=t}(e,t)}}t.exports=g;var f,s=!e.browser&&["v0.10","v0.9."].indexOf(e.version.slice(0,5))>-1?n:o.nextTick;g.WritableState=v;var c=r(12);c.inherits=r(0);var u={deprecate:r(75)},h=r(32),d=r(1).Buffer,l=i.Uint8Array||function(){};var p,b=r(33);function y(){}function v(t,e){f=f||r(7),t=t||{};var n=e instanceof f;this.objectMode=!!t.objectMode,n&&(this.objectMode=this.objectMode||!!t.writableObjectMode);var i=t.highWaterMark,c=t.writableHighWaterMark,u=this.objectMode?16:16384;this.highWaterMark=i||0===i?i:n&&(c||0===c)?c:u,this.highWaterMark=Math.floor(this.highWaterMark),this.finalCalled=!1,this.needDrain=!1,this.ending=!1,this.ended=!1,this.finished=!1,this.destroyed=!1;var h=!1===t.decodeStrings;this.decodeStrings=!h,this.defaultEncoding=t.defaultEncoding||"utf8",this.length=0,this.writing=!1,this.corked=0,this.sync=!0,this.bufferProcessing=!1,this.onwrite=function(t){!function(t,e){var r=t._writableState,n=r.sync,i=r.writecb;if(function(t){t.writing=!1,t.writecb=null,t.length-=t.writelen,t.writelen=0}(r),e)!function(t,e,r,n,i){--e.pendingcb,r?(o.nextTick(i,n),o.nextTick(M,t,e),t._writableState.errorEmitted=!0,t.emit("error",n)):(i(n),t._writableState.errorEmitted=!0,t.emit("error",n),M(t,e))}(t,r,n,e,i);else{var a=S(r);a||r.corked||r.bufferProcessing||!r.bufferedRequest||w(t,r),n?s(_,t,r,a,i):_(t,r,a,i)}}(e,t)},this.writecb=null,this.writelen=0,this.bufferedRequest=null,this.lastBufferedRequest=null,this.pendingcb=0,this.prefinished=!1,this.errorEmitted=!1,this.bufferedRequestCount=0,this.corkedRequestsFree=new a(this)}function g(t){if(f=f||r(7),!(p.call(g,this)||this instanceof f))return new g(t);this._writableState=new v(t,this),this.writable=!0,t&&("function"==typeof t.write&&(this._write=t.write),"function"==typeof t.writev&&(this._writev=t.writev),"function"==typeof t.destroy&&(this._destroy=t.destroy),"function"==typeof t.final&&(this._final=t.final)),h.call(this)}function m(t,e,r,n,i,o,a){e.writelen=n,e.writecb=a,e.writing=!0,e.sync=!0,r?t._writev(i,e.onwrite):t._write(i,o,e.onwrite),e.sync=!1}function _(t,e,r,n){r||function(t,e){0===e.length&&e.needDrain&&(e.needDrain=!1,t.emit("drain"))}(t,e),e.pendingcb--,n(),M(t,e)}function w(t,e){e.bufferProcessing=!0;var r=e.bufferedRequest;if(t._writev&&r&&r.next){var n=e.bufferedRequestCount,i=new Array(n),o=e.corkedRequestsFree;o.entry=r;for(var f=0,s=!0;r;)i[f]=r,r.isBuf||(s=!1),r=r.next,f+=1;i.allBuffers=s,m(t,e,!0,e.length,i,"",o.finish),e.pendingcb++,e.lastBufferedRequest=null,o.next?(e.corkedRequestsFree=o.next,o.next=null):e.corkedRequestsFree=new a(e),e.bufferedRequestCount=0}else{for(;r;){var c=r.chunk,u=r.encoding,h=r.callback;if(m(t,e,!1,e.objectMode?1:c.length,c,u,h),r=r.next,e.bufferedRequestCount--,e.writing)break}null===r&&(e.lastBufferedRequest=null)}e.bufferedRequest=r,e.bufferProcessing=!1}function S(t){return t.ending&&0===t.length&&null===t.bufferedRequest&&!t.finished&&!t.writing}function E(t,e){t._final(function(r){e.pendingcb--,r&&t.emit("error",r),e.prefinished=!0,t.emit("prefinish"),M(t,e)})}function M(t,e){var r=S(e);return r&&(!function(t,e){e.prefinished||e.finalCalled||("function"==typeof t._final?(e.pendingcb++,e.finalCalled=!0,o.nextTick(E,t,e)):(e.prefinished=!0,t.emit("prefinish")))}(t,e),0===e.pendingcb&&(e.finished=!0,t.emit("finish"))),r}c.inherits(g,h),v.prototype.getBuffer=function(){for(var t=this.bufferedRequest,e=[];t;)e.push(t),t=t.next;return e},function(){try{Object.defineProperty(v.prototype,"buffer",{get:u.deprecate(function(){return this.getBuffer()},"_writableState.buffer is deprecated. Use _writableState.getBuffer instead.","DEP0003")})}catch(t){}}(),"function"==typeof Symbol&&Symbol.hasInstance&&"function"==typeof Function.prototype[Symbol.hasInstance]?(p=Function.prototype[Symbol.hasInstance],Object.defineProperty(g,Symbol.hasInstance,{value:function(t){return!!p.call(this,t)||this===g&&(t&&t._writableState instanceof v)}})):p=function(t){return t instanceof this},g.prototype.pipe=function(){this.emit("error",new Error("Cannot pipe, not readable"))},g.prototype.write=function(t,e,r){var n=this._writableState,i=!1,a=!n.objectMode&&function(t){return d.isBuffer(t)||t instanceof l}(t);return a&&!d.isBuffer(t)&&(t=function(t){return d.from(t)}(t)),"function"==typeof e&&(r=e,e=null),a?e="buffer":e||(e=n.defaultEncoding),"function"!=typeof r&&(r=y),n.ended?function(t,e){var r=new Error("write after end");t.emit("error",r),o.nextTick(e,r)}(this,r):(a||function(t,e,r,n){var i=!0,a=!1;return null===r?a=new TypeError("May not write null values to stream"):"string"==typeof r||void 0===r||e.objectMode||(a=new TypeError("Invalid non-string/buffer chunk")),a&&(t.emit("error",a),o.nextTick(n,a),i=!1),i}(this,n,t,r))&&(n.pendingcb++,i=function(t,e,r,n,i,o){if(!r){var a=function(t,e,r){t.objectMode||!1===t.decodeStrings||"string"!=typeof e||(e=d.from(e,r));return e}(e,n,i);n!==a&&(r=!0,i="buffer",n=a)}var f=e.objectMode?1:n.length;e.length+=f;var s=e.length<e.highWaterMark;s||(e.needDrain=!0);if(e.writing||e.corked){var c=e.lastBufferedRequest;e.lastBufferedRequest={chunk:n,encoding:i,isBuf:r,callback:o,next:null},c?c.next=e.lastBufferedRequest:e.bufferedRequest=e.lastBufferedRequest,e.bufferedRequestCount+=1}else m(t,e,!1,f,n,i,o);return s}(this,n,a,t,e,r)),i},g.prototype.cork=function(){this._writableState.corked++},g.prototype.uncork=function(){var t=this._writableState;t.corked&&(t.corked--,t.writing||t.corked||t.finished||t.bufferProcessing||!t.bufferedRequest||w(this,t))},g.prototype.setDefaultEncoding=function(t){if("string"==typeof t&&(t=t.toLowerCase()),!(["hex","utf8","utf-8","ascii","binary","base64","ucs2","ucs-2","utf16le","utf-16le","raw"].indexOf((t+"").toLowerCase())>-1))throw new TypeError("Unknown encoding: "+t);return this._writableState.defaultEncoding=t,this},Object.defineProperty(g.prototype,"writableHighWaterMark",{enumerable:!1,get:function(){return this._writableState.highWaterMark}}),g.prototype._write=function(t,e,r){r(new Error("_write() is not implemented"))},g.prototype._writev=null,g.prototype.end=function(t,e,r){var n=this._writableState;"function"==typeof t?(r=t,t=null,e=null):"function"==typeof e&&(r=e,e=null),null!==t&&void 0!==t&&this.write(t,e),n.corked&&(n.corked=1,this.uncork()),n.ending||n.finished||function(t,e,r){e.ending=!0,M(t,e),r&&(e.finished?o.nextTick(r):t.once("finish",r));e.ended=!0,t.writable=!1}(this,n,r)},Object.defineProperty(g.prototype,"destroyed",{get:function(){return void 0!==this._writableState&&this._writableState.destroyed},set:function(t){this._writableState&&(this._writableState.destroyed=t)}}),g.prototype.destroy=b.destroy,g.prototype._undestroy=b.undestroy,g.prototype._destroy=function(t,e){this.end(),e(t)}}).call(this,r(6),r(34).setImmediate,r(4))},function(t,e,r){"use strict";var n=r(1).Buffer,i=n.isEncoding||function(t){switch((t=""+t)&&t.toLowerCase()){case"hex":case"utf8":case"utf-8":case"ascii":case"binary":case"base64":case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":case"raw":return!0;default:return!1}};function o(t){var e;switch(this.encoding=function(t){var e=function(t){if(!t)return"utf8";for(var e;;)switch(t){case"utf8":case"utf-8":return"utf8";case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return"utf16le";case"latin1":case"binary":return"latin1";case"base64":case"ascii":case"hex":return t;default:if(e)return;t=(""+t).toLowerCase(),e=!0}}(t);if("string"!=typeof e&&(n.isEncoding===i||!i(t)))throw new Error("Unknown encoding: "+t);return e||t}(t),this.encoding){case"utf16le":this.text=s,this.end=c,e=4;break;case"utf8":this.fillLast=f,e=4;break;case"base64":this.text=u,this.end=h,e=3;break;default:return this.write=d,void(this.end=l)}this.lastNeed=0,this.lastTotal=0,this.lastChar=n.allocUnsafe(e)}function a(t){return t<=127?0:t>>5==6?2:t>>4==14?3:t>>3==30?4:t>>6==2?-1:-2}function f(t){var e=this.lastTotal-this.lastNeed,r=function(t,e,r){if(128!=(192&e[0]))return t.lastNeed=0,"�";if(t.lastNeed>1&&e.length>1){if(128!=(192&e[1]))return t.lastNeed=1,"�";if(t.lastNeed>2&&e.length>2&&128!=(192&e[2]))return t.lastNeed=2,"�"}}(this,t);return void 0!==r?r:this.lastNeed<=t.length?(t.copy(this.lastChar,e,0,this.lastNeed),this.lastChar.toString(this.encoding,0,this.lastTotal)):(t.copy(this.lastChar,e,0,t.length),void(this.lastNeed-=t.length))}function s(t,e){if((t.length-e)%2==0){var r=t.toString("utf16le",e);if(r){var n=r.charCodeAt(r.length-1);if(n>=55296&&n<=56319)return this.lastNeed=2,this.lastTotal=4,this.lastChar[0]=t[t.length-2],this.lastChar[1]=t[t.length-1],r.slice(0,-1)}return r}return this.lastNeed=1,this.lastTotal=2,this.lastChar[0]=t[t.length-1],t.toString("utf16le",e,t.length-1)}function c(t){var e=t&&t.length?this.write(t):"";if(this.lastNeed){var r=this.lastTotal-this.lastNeed;return e+this.lastChar.toString("utf16le",0,r)}return e}function u(t,e){var r=(t.length-e)%3;return 0===r?t.toString("base64",e):(this.lastNeed=3-r,this.lastTotal=3,1===r?this.lastChar[0]=t[t.length-1]:(this.lastChar[0]=t[t.length-2],this.lastChar[1]=t[t.length-1]),t.toString("base64",e,t.length-r))}function h(t){var e=t&&t.length?this.write(t):"";return this.lastNeed?e+this.lastChar.toString("base64",0,3-this.lastNeed):e}function d(t){return t.toString(this.encoding)}function l(t){return t&&t.length?this.write(t):""}e.StringDecoder=o,o.prototype.write=function(t){if(0===t.length)return"";var e,r;if(this.lastNeed){if(void 0===(e=this.fillLast(t)))return"";r=this.lastNeed,this.lastNeed=0}else r=0;return r<t.length?e?e+this.text(t,r):this.text(t,r):e||""},o.prototype.end=function(t){var e=t&&t.length?this.write(t):"";return this.lastNeed?e+"�":e},o.prototype.text=function(t,e){var r=function(t,e,r){var n=e.length-1;if(n<r)return 0;var i=a(e[n]);if(i>=0)return i>0&&(t.lastNeed=i-1),i;if(--n<r||-2===i)return 0;if((i=a(e[n]))>=0)return i>0&&(t.lastNeed=i-2),i;if(--n<r||-2===i)return 0;if((i=a(e[n]))>=0)return i>0&&(2===i?i=0:t.lastNeed=i-3),i;return 0}(this,t,e);if(!this.lastNeed)return t.toString("utf8",e);this.lastTotal=r;var n=t.length-(r-this.lastNeed);return t.copy(this.lastChar,0,n),t.toString("utf8",e,n)},o.prototype.fillLast=function(t){if(this.lastNeed<=t.length)return t.copy(this.lastChar,this.lastTotal-this.lastNeed,0,this.lastNeed),this.lastChar.toString(this.encoding,0,this.lastTotal);t.copy(this.lastChar,this.lastTotal-this.lastNeed,0,t.length),this.lastNeed-=t.length}},function(t,e){t.exports=function(t){return t.webpackPolyfill||(t.deprecate=function(){},t.paths=[],t.children||(t.children=[]),Object.defineProperty(t,"loaded",{enumerable:!0,get:function(){return t.l}}),Object.defineProperty(t,"id",{enumerable:!0,get:function(){return t.i}}),t.webpackPolyfill=1),t}},function(t,e,r){var n=e;n.utils=r(5),n.common=r(13),n.sha=r(108),n.ripemd=r(112),n.hmac=r(113),n.sha1=n.sha.sha1,n.sha256=n.sha.sha256,n.sha224=n.sha.sha224,n.sha384=n.sha.sha384,n.sha512=n.sha.sha512,n.ripemd160=n.ripemd.ripemd160},function(t,e){t.exports=function(){for(var t={},e=0;e<arguments.length;e++){var n=arguments[e];for(var i in n)r.call(n,i)&&(t[i]=n[i])}return t};var r=Object.prototype.hasOwnProperty},function(t,e,r){var n=r(132),i=r(52);t.exports=function(t){return null!=t&&i(t.length)&&!n(t)}},function(t,e,r){var n=r(48),i=r(133),o=r(134),a="[object Null]",f="[object Undefined]",s=n?n.toStringTag:void 0;t.exports=function(t){return null==t?void 0===t?f:a:s&&s in Object(t)?i(t):o(t)}},function(t,e){t.exports=function(){}},function(t,e){t.exports=function(t){return null!=t&&"object"==typeof t}},function(t,e,r){const n=r(168),i=r(24);t.exports=function(t){return i({id:n(),jsonrpc:"2.0",params:[]},t)}},function(t,e){var r={}.toString;t.exports=Array.isArray||function(t){return"[object Array]"==r.call(t)}},function(t,e,r){"use strict";(function(e,n){var i=r(17);t.exports=m;var o,a=r(30);m.ReadableState=g;r(9).EventEmitter;var f=function(t,e){return t.listeners(e).length},s=r(32),c=r(1).Buffer,u=e.Uint8Array||function(){};var h=r(12);h.inherits=r(0);var d=r(71),l=void 0;l=d&&d.debuglog?d.debuglog("stream"):function(){};var p,b=r(72),y=r(33);h.inherits(m,s);var v=["error","close","destroy","pause","resume"];function g(t,e){o=o||r(7),t=t||{};var n=e instanceof o;this.objectMode=!!t.objectMode,n&&(this.objectMode=this.objectMode||!!t.readableObjectMode);var i=t.highWaterMark,a=t.readableHighWaterMark,f=this.objectMode?16:16384;this.highWaterMark=i||0===i?i:n&&(a||0===a)?a:f,this.highWaterMark=Math.floor(this.highWaterMark),this.buffer=new b,this.length=0,this.pipes=null,this.pipesCount=0,this.flowing=null,this.ended=!1,this.endEmitted=!1,this.reading=!1,this.sync=!0,this.needReadable=!1,this.emittedReadable=!1,this.readableListening=!1,this.resumeScheduled=!1,this.destroyed=!1,this.defaultEncoding=t.defaultEncoding||"utf8",this.awaitDrain=0,this.readingMore=!1,this.decoder=null,this.encoding=null,t.encoding&&(p||(p=r(21).StringDecoder),this.decoder=new p(t.encoding),this.encoding=t.encoding)}function m(t){if(o=o||r(7),!(this instanceof m))return new m(t);this._readableState=new g(t,this),this.readable=!0,t&&("function"==typeof t.read&&(this._read=t.read),"function"==typeof t.destroy&&(this._destroy=t.destroy)),s.call(this)}function _(t,e,r,n,i){var o,a=t._readableState;null===e?(a.reading=!1,function(t,e){if(e.ended)return;if(e.decoder){var r=e.decoder.end();r&&r.length&&(e.buffer.push(r),e.length+=e.objectMode?1:r.length)}e.ended=!0,M(t)}(t,a)):(i||(o=function(t,e){var r;(function(t){return c.isBuffer(t)||t instanceof u})(e)||"string"==typeof e||void 0===e||t.objectMode||(r=new TypeError("Invalid non-string/buffer chunk"));return r}(a,e)),o?t.emit("error",o):a.objectMode||e&&e.length>0?("string"==typeof e||a.objectMode||Object.getPrototypeOf(e)===c.prototype||(e=function(t){return c.from(t)}(e)),n?a.endEmitted?t.emit("error",new Error("stream.unshift() after end event")):w(t,a,e,!0):a.ended?t.emit("error",new Error("stream.push() after EOF")):(a.reading=!1,a.decoder&&!r?(e=a.decoder.write(e),a.objectMode||0!==e.length?w(t,a,e,!1):x(t,a)):w(t,a,e,!1))):n||(a.reading=!1));return function(t){return!t.ended&&(t.needReadable||t.length<t.highWaterMark||0===t.length)}(a)}function w(t,e,r,n){e.flowing&&0===e.length&&!e.sync?(t.emit("data",r),t.read(0)):(e.length+=e.objectMode?1:r.length,n?e.buffer.unshift(r):e.buffer.push(r),e.needReadable&&M(t)),x(t,e)}Object.defineProperty(m.prototype,"destroyed",{get:function(){return void 0!==this._readableState&&this._readableState.destroyed},set:function(t){this._readableState&&(this._readableState.destroyed=t)}}),m.prototype.destroy=y.destroy,m.prototype._undestroy=y.undestroy,m.prototype._destroy=function(t,e){this.push(null),e(t)},m.prototype.push=function(t,e){var r,n=this._readableState;return n.objectMode?r=!0:"string"==typeof t&&((e=e||n.defaultEncoding)!==n.encoding&&(t=c.from(t,e),e=""),r=!0),_(this,t,e,!1,r)},m.prototype.unshift=function(t){return _(this,t,null,!0,!1)},m.prototype.isPaused=function(){return!1===this._readableState.flowing},m.prototype.setEncoding=function(t){return p||(p=r(21).StringDecoder),this._readableState.decoder=new p(t),this._readableState.encoding=t,this};var S=8388608;function E(t,e){return t<=0||0===e.length&&e.ended?0:e.objectMode?1:t!=t?e.flowing&&e.length?e.buffer.head.data.length:e.length:(t>e.highWaterMark&&(e.highWaterMark=function(t){return t>=S?t=S:(t--,t|=t>>>1,t|=t>>>2,t|=t>>>4,t|=t>>>8,t|=t>>>16,t++),t}(t)),t<=e.length?t:e.ended?e.length:(e.needReadable=!0,0))}function M(t){var e=t._readableState;e.needReadable=!1,e.emittedReadable||(l("emitReadable",e.flowing),e.emittedReadable=!0,e.sync?i.nextTick(A,t):A(t))}function A(t){l("emit readable"),t.emit("readable"),R(t)}function x(t,e){e.readingMore||(e.readingMore=!0,i.nextTick(k,t,e))}function k(t,e){for(var r=e.length;!e.reading&&!e.flowing&&!e.ended&&e.length<e.highWaterMark&&(l("maybeReadMore read 0"),t.read(0),r!==e.length);)r=e.length;e.readingMore=!1}function I(t){l("readable nexttick read 0"),t.read(0)}function B(t,e){e.reading||(l("resume read 0"),t.read(0)),e.resumeScheduled=!1,e.awaitDrain=0,t.emit("resume"),R(t),e.flowing&&!e.reading&&t.read(0)}function R(t){var e=t._readableState;for(l("flow",e.flowing);e.flowing&&null!==t.read(););}function P(t,e){return 0===e.length?null:(e.objectMode?r=e.buffer.shift():!t||t>=e.length?(r=e.decoder?e.buffer.join(""):1===e.buffer.length?e.buffer.head.data:e.buffer.concat(e.length),e.buffer.clear()):r=function(t,e,r){var n;t<e.head.data.length?(n=e.head.data.slice(0,t),e.head.data=e.head.data.slice(t)):n=t===e.head.data.length?e.shift():r?function(t,e){var r=e.head,n=1,i=r.data;t-=i.length;for(;r=r.next;){var o=r.data,a=t>o.length?o.length:t;if(a===o.length?i+=o:i+=o.slice(0,t),0===(t-=a)){a===o.length?(++n,r.next?e.head=r.next:e.head=e.tail=null):(e.head=r,r.data=o.slice(a));break}++n}return e.length-=n,i}(t,e):function(t,e){var r=c.allocUnsafe(t),n=e.head,i=1;n.data.copy(r),t-=n.data.length;for(;n=n.next;){var o=n.data,a=t>o.length?o.length:t;if(o.copy(r,r.length-t,0,a),0===(t-=a)){a===o.length?(++i,n.next?e.head=n.next:e.head=e.tail=null):(e.head=n,n.data=o.slice(a));break}++i}return e.length-=i,r}(t,e);return n}(t,e.buffer,e.decoder),r);var r}function T(t){var e=t._readableState;if(e.length>0)throw new Error('"endReadable()" called on non-empty stream');e.endEmitted||(e.ended=!0,i.nextTick(L,e,t))}function L(t,e){t.endEmitted||0!==t.length||(t.endEmitted=!0,e.readable=!1,e.emit("end"))}function O(t,e){for(var r=0,n=t.length;r<n;r++)if(t[r]===e)return r;return-1}m.prototype.read=function(t){l("read",t),t=parseInt(t,10);var e=this._readableState,r=t;if(0!==t&&(e.emittedReadable=!1),0===t&&e.needReadable&&(e.length>=e.highWaterMark||e.ended))return l("read: emitReadable",e.length,e.ended),0===e.length&&e.ended?T(this):M(this),null;if(0===(t=E(t,e))&&e.ended)return 0===e.length&&T(this),null;var n,i=e.needReadable;return l("need readable",i),(0===e.length||e.length-t<e.highWaterMark)&&l("length less than watermark",i=!0),e.ended||e.reading?l("reading or ended",i=!1):i&&(l("do read"),e.reading=!0,e.sync=!0,0===e.length&&(e.needReadable=!0),this._read(e.highWaterMark),e.sync=!1,e.reading||(t=E(r,e))),null===(n=t>0?P(t,e):null)?(e.needReadable=!0,t=0):e.length-=t,0===e.length&&(e.ended||(e.needReadable=!0),r!==t&&e.ended&&T(this)),null!==n&&this.emit("data",n),n},m.prototype._read=function(t){this.emit("error",new Error("_read() is not implemented"))},m.prototype.pipe=function(t,e){var r=this,o=this._readableState;switch(o.pipesCount){case 0:o.pipes=t;break;case 1:o.pipes=[o.pipes,t];break;default:o.pipes.push(t)}o.pipesCount+=1,l("pipe count=%d opts=%j",o.pipesCount,e);var s=(!e||!1!==e.end)&&t!==n.stdout&&t!==n.stderr?u:m;function c(e,n){l("onunpipe"),e===r&&n&&!1===n.hasUnpiped&&(n.hasUnpiped=!0,l("cleanup"),t.removeListener("close",v),t.removeListener("finish",g),t.removeListener("drain",h),t.removeListener("error",y),t.removeListener("unpipe",c),r.removeListener("end",u),r.removeListener("end",m),r.removeListener("data",b),d=!0,!o.awaitDrain||t._writableState&&!t._writableState.needDrain||h())}function u(){l("onend"),t.end()}o.endEmitted?i.nextTick(s):r.once("end",s),t.on("unpipe",c);var h=function(t){return function(){var e=t._readableState;l("pipeOnDrain",e.awaitDrain),e.awaitDrain&&e.awaitDrain--,0===e.awaitDrain&&f(t,"data")&&(e.flowing=!0,R(t))}}(r);t.on("drain",h);var d=!1;var p=!1;function b(e){l("ondata"),p=!1,!1!==t.write(e)||p||((1===o.pipesCount&&o.pipes===t||o.pipesCount>1&&-1!==O(o.pipes,t))&&!d&&(l("false write response, pause",r._readableState.awaitDrain),r._readableState.awaitDrain++,p=!0),r.pause())}function y(e){l("onerror",e),m(),t.removeListener("error",y),0===f(t,"error")&&t.emit("error",e)}function v(){t.removeListener("finish",g),m()}function g(){l("onfinish"),t.removeListener("close",v),m()}function m(){l("unpipe"),r.unpipe(t)}return r.on("data",b),function(t,e,r){if("function"==typeof t.prependListener)return t.prependListener(e,r);t._events&&t._events[e]?a(t._events[e])?t._events[e].unshift(r):t._events[e]=[r,t._events[e]]:t.on(e,r)}(t,"error",y),t.once("close",v),t.once("finish",g),t.emit("pipe",r),o.flowing||(l("pipe resume"),r.resume()),t},m.prototype.unpipe=function(t){var e=this._readableState,r={hasUnpiped:!1};if(0===e.pipesCount)return this;if(1===e.pipesCount)return t&&t!==e.pipes?this:(t||(t=e.pipes),e.pipes=null,e.pipesCount=0,e.flowing=!1,t&&t.emit("unpipe",this,r),this);if(!t){var n=e.pipes,i=e.pipesCount;e.pipes=null,e.pipesCount=0,e.flowing=!1;for(var o=0;o<i;o++)n[o].emit("unpipe",this,r);return this}var a=O(e.pipes,t);return-1===a?this:(e.pipes.splice(a,1),e.pipesCount-=1,1===e.pipesCount&&(e.pipes=e.pipes[0]),t.emit("unpipe",this,r),this)},m.prototype.on=function(t,e){var r=s.prototype.on.call(this,t,e);if("data"===t)!1!==this._readableState.flowing&&this.resume();else if("readable"===t){var n=this._readableState;n.endEmitted||n.readableListening||(n.readableListening=n.needReadable=!0,n.emittedReadable=!1,n.reading?n.length&&M(this):i.nextTick(I,this))}return r},m.prototype.addListener=m.prototype.on,m.prototype.resume=function(){var t=this._readableState;return t.flowing||(l("resume"),t.flowing=!0,function(t,e){e.resumeScheduled||(e.resumeScheduled=!0,i.nextTick(B,t,e))}(this,t)),this},m.prototype.pause=function(){return l("call pause flowing=%j",this._readableState.flowing),!1!==this._readableState.flowing&&(l("pause"),this._readableState.flowing=!1,this.emit("pause")),this},m.prototype.wrap=function(t){var e=this,r=this._readableState,n=!1;for(var i in t.on("end",function(){if(l("wrapped end"),r.decoder&&!r.ended){var t=r.decoder.end();t&&t.length&&e.push(t)}e.push(null)}),t.on("data",function(i){(l("wrapped data"),r.decoder&&(i=r.decoder.write(i)),!r.objectMode||null!==i&&void 0!==i)&&((r.objectMode||i&&i.length)&&(e.push(i)||(n=!0,t.pause())))}),t)void 0===this[i]&&"function"==typeof t[i]&&(this[i]=function(e){return function(){return t[e].apply(t,arguments)}}(i));for(var o=0;o<v.length;o++)t.on(v[o],this.emit.bind(this,v[o]));return this._read=function(e){l("wrapped _read",e),n&&(n=!1,t.resume())},this},Object.defineProperty(m.prototype,"readableHighWaterMark",{enumerable:!1,get:function(){return this._readableState.highWaterMark}}),m._fromList=P}).call(this,r(4),r(6))},function(t,e,r){t.exports=r(9).EventEmitter},function(t,e,r){"use strict";var n=r(17);function i(t,e){t.emit("error",e)}t.exports={destroy:function(t,e){var r=this,o=this._readableState&&this._readableState.destroyed,a=this._writableState&&this._writableState.destroyed;return o||a?(e?e(t):!t||this._writableState&&this._writableState.errorEmitted||n.nextTick(i,this,t),this):(this._readableState&&(this._readableState.destroyed=!0),this._writableState&&(this._writableState.destroyed=!0),this._destroy(t||null,function(t){!e&&t?(n.nextTick(i,r,t),r._writableState&&(r._writableState.errorEmitted=!0)):e&&e(t)}),this)},undestroy:function(){this._readableState&&(this._readableState.destroyed=!1,this._readableState.reading=!1,this._readableState.ended=!1,this._readableState.endEmitted=!1),this._writableState&&(this._writableState.destroyed=!1,this._writableState.ended=!1,this._writableState.ending=!1,this._writableState.finished=!1,this._writableState.errorEmitted=!1)}}},function(t,e,r){(function(t){var n=void 0!==t&&t||"undefined"!=typeof self&&self||window,i=Function.prototype.apply;function o(t,e){this._id=t,this._clearFn=e}e.setTimeout=function(){return new o(i.call(setTimeout,n,arguments),clearTimeout)},e.setInterval=function(){return new o(i.call(setInterval,n,arguments),clearInterval)},e.clearTimeout=e.clearInterval=function(t){t&&t.close()},o.prototype.unref=o.prototype.ref=function(){},o.prototype.close=function(){this._clearFn.call(n,this._id)},e.enroll=function(t,e){clearTimeout(t._idleTimeoutId),t._idleTimeout=e},e.unenroll=function(t){clearTimeout(t._idleTimeoutId),t._idleTimeout=-1},e._unrefActive=e.active=function(t){clearTimeout(t._idleTimeoutId);var e=t._idleTimeout;e>=0&&(t._idleTimeoutId=setTimeout(function(){t._onTimeout&&t._onTimeout()},e))},r(74),e.setImmediate="undefined"!=typeof self&&self.setImmediate||void 0!==t&&t.setImmediate||this&&this.setImmediate,e.clearImmediate="undefined"!=typeof self&&self.clearImmediate||void 0!==t&&t.clearImmediate||this&&this.clearImmediate}).call(this,r(4))},function(t,e,r){"use strict";t.exports=o;var n=r(7),i=r(12);function o(t){if(!(this instanceof o))return new o(t);n.call(this,t),this._transformState={afterTransform:function(t,e){var r=this._transformState;r.transforming=!1;var n=r.writecb;if(!n)return this.emit("error",new Error("write callback called multiple times"));r.writechunk=null,r.writecb=null,null!=e&&this.push(e),n(t);var i=this._readableState;i.reading=!1,(i.needReadable||i.length<i.highWaterMark)&&this._read(i.highWaterMark)}.bind(this),needTransform:!1,transforming:!1,writecb:null,writechunk:null,writeencoding:null},this._readableState.needReadable=!0,this._readableState.sync=!1,t&&("function"==typeof t.transform&&(this._transform=t.transform),"function"==typeof t.flush&&(this._flush=t.flush)),this.on("prefinish",a)}function a(){var t=this;"function"==typeof this._flush?this._flush(function(e,r){f(t,e,r)}):f(this,null,null)}function f(t,e,r){if(e)return t.emit("error",e);if(null!=r&&t.push(r),t._writableState.length)throw new Error("Calling transform done when ws.length != 0");if(t._transformState.transforming)throw new Error("Calling transform done when still transforming");return t.push(null)}i.inherits=r(0),i.inherits(o,n),o.prototype.push=function(t,e){return this._transformState.needTransform=!1,n.prototype.push.call(this,t,e)},o.prototype._transform=function(t,e,r){throw new Error("_transform() is not implemented")},o.prototype._write=function(t,e,r){var n=this._transformState;if(n.writecb=r,n.writechunk=t,n.writeencoding=e,!n.transforming){var i=this._readableState;(n.needTransform||i.needReadable||i.length<i.highWaterMark)&&this._read(i.highWaterMark)}},o.prototype._read=function(t){var e=this._transformState;null!==e.writechunk&&e.writecb&&!e.transforming?(e.transforming=!0,this._transform(e.writechunk,e.writeencoding,e.afterTransform)):e.needTransform=!0},o.prototype._destroy=function(t,e){var r=this;n.prototype._destroy.call(this,t,function(t){e(t),r.emit("close")})}},function(t){t.exports={COMPRESSED_TYPE_INVALID:"compressed should be a boolean",EC_PRIVATE_KEY_TYPE_INVALID:"private key should be a Buffer",EC_PRIVATE_KEY_LENGTH_INVALID:"private key length is invalid",EC_PRIVATE_KEY_RANGE_INVALID:"private key range is invalid",EC_PRIVATE_KEY_TWEAK_ADD_FAIL:"tweak out of range or resulting private key is invalid",EC_PRIVATE_KEY_TWEAK_MUL_FAIL:"tweak out of range",EC_PRIVATE_KEY_EXPORT_DER_FAIL:"couldn't export to DER format",EC_PRIVATE_KEY_IMPORT_DER_FAIL:"couldn't import from DER format",EC_PUBLIC_KEYS_TYPE_INVALID:"public keys should be an Array",EC_PUBLIC_KEYS_LENGTH_INVALID:"public keys Array should have at least 1 element",EC_PUBLIC_KEY_TYPE_INVALID:"public key should be a Buffer",EC_PUBLIC_KEY_LENGTH_INVALID:"public key length is invalid",EC_PUBLIC_KEY_PARSE_FAIL:"the public key could not be parsed or is invalid",EC_PUBLIC_KEY_CREATE_FAIL:"private was invalid, try again",EC_PUBLIC_KEY_TWEAK_ADD_FAIL:"tweak out of range or resulting public key is invalid",EC_PUBLIC_KEY_TWEAK_MUL_FAIL:"tweak out of range",EC_PUBLIC_KEY_COMBINE_FAIL:"the sum of the public keys is not valid",ECDH_FAIL:"scalar was invalid (zero or overflow)",ECDSA_SIGNATURE_TYPE_INVALID:"signature should be a Buffer",ECDSA_SIGNATURE_LENGTH_INVALID:"signature length is invalid",ECDSA_SIGNATURE_PARSE_FAIL:"couldn't parse signature",ECDSA_SIGNATURE_PARSE_DER_FAIL:"couldn't parse DER signature",ECDSA_SIGNATURE_SERIALIZE_DER_FAIL:"couldn't serialize signature to DER format",ECDSA_SIGN_FAIL:"nonce generation function failed or private key is invalid",ECDSA_RECOVER_FAIL:"couldn't recover public key from signature",MSG32_TYPE_INVALID:"message should be a Buffer",MSG32_LENGTH_INVALID:"message length is invalid",OPTIONS_TYPE_INVALID:"options should be an Object",OPTIONS_DATA_TYPE_INVALID:"options.data should be a Buffer",OPTIONS_DATA_LENGTH_INVALID:"options.data length is invalid",OPTIONS_NONCEFN_TYPE_INVALID:"options.noncefn should be a Function",RECOVERY_ID_TYPE_INVALID:"recovery should be a Number",RECOVERY_ID_VALUE_INVALID:"recovery should have value between -1 and 4",TWEAK_TYPE_INVALID:"tweak should be a Buffer",TWEAK_LENGTH_INVALID:"tweak length is invalid"}},function(t,e,r){"use strict";var n=r(0),i=r(90),o=r(91),a=r(92),f=r(97);function s(t){f.call(this,"digest"),this._hash=t}n(s,f),s.prototype._update=function(t){this._hash.update(t)},s.prototype._final=function(){return this._hash.digest()},t.exports=function(t){return"md5"===(t=t.toLowerCase())?new i:"rmd160"===t||"ripemd160"===t?new o:new s(a(t))}},function(t,e,r){"use strict";var n=r(1).Buffer,i=r(16).Transform;function o(t){i.call(this),this._block=n.allocUnsafe(t),this._blockSize=t,this._blockOffset=0,this._length=[0,0,0,0],this._finalized=!1}r(0)(o,i),o.prototype._transform=function(t,e,r){var n=null;try{this.update(t,e)}catch(t){n=t}r(n)},o.prototype._flush=function(t){var e=null;try{this.push(this.digest())}catch(t){e=t}t(e)},o.prototype.update=function(t,e){if(function(t,e){if(!n.isBuffer(t)&&"string"!=typeof t)throw new TypeError(e+" must be a string or a buffer")}(t,"Data"),this._finalized)throw new Error("Digest already called");n.isBuffer(t)||(t=n.from(t,e));for(var r=this._block,i=0;this._blockOffset+t.length-i>=this._blockSize;){for(var o=this._blockOffset;o<this._blockSize;)r[o++]=t[i++];this._update(),this._blockOffset=0}for(;i<t.length;)r[this._blockOffset++]=t[i++];for(var a=0,f=8*t.length;f>0;++a)this._length[a]+=f,(f=this._length[a]/4294967296|0)>0&&(this._length[a]-=4294967296*f);return this},o.prototype._update=function(){throw new Error("_update is not implemented")},o.prototype.digest=function(t){if(this._finalized)throw new Error("Digest already called");this._finalized=!0;var e=this._digest();void 0!==t&&(e=e.toString(t)),this._block.fill(0),this._blockOffset=0;for(var r=0;r<4;++r)this._length[r]=0;return e},o.prototype._digest=function(){throw new Error("_digest is not implemented")},t.exports=o},function(t,e,r){var n=r(0),i=r(10),o=r(1).Buffer,a=[1116352408,1899447441,3049323471,3921009573,961987163,1508970993,2453635748,2870763221,3624381080,310598401,607225278,1426881987,1925078388,2162078206,2614888103,3248222580,3835390401,4022224774,264347078,604807628,770255983,1249150122,1555081692,1996064986,2554220882,2821834349,2952996808,3210313671,3336571891,3584528711,113926993,338241895,666307205,773529912,1294757372,1396182291,1695183700,1986661051,2177026350,2456956037,2730485921,2820302411,3259730800,3345764771,3516065817,3600352804,4094571909,275423344,430227734,506948616,659060556,883997877,958139571,1322822218,1537002063,1747873779,1955562222,2024104815,2227730452,2361852424,2428436474,2756734187,3204031479,3329325298],f=new Array(64);function s(){this.init(),this._w=f,i.call(this,64,56)}function c(t,e,r){return r^t&(e^r)}function u(t,e,r){return t&e|r&(t|e)}function h(t){return(t>>>2|t<<30)^(t>>>13|t<<19)^(t>>>22|t<<10)}function d(t){return(t>>>6|t<<26)^(t>>>11|t<<21)^(t>>>25|t<<7)}function l(t){return(t>>>7|t<<25)^(t>>>18|t<<14)^t>>>3}function p(t){return(t>>>17|t<<15)^(t>>>19|t<<13)^t>>>10}n(s,i),s.prototype.init=function(){return this._a=1779033703,this._b=3144134277,this._c=1013904242,this._d=2773480762,this._e=1359893119,this._f=2600822924,this._g=528734635,this._h=1541459225,this},s.prototype._update=function(t){for(var e=this._w,r=0|this._a,n=0|this._b,i=0|this._c,o=0|this._d,f=0|this._e,s=0|this._f,b=0|this._g,y=0|this._h,v=0;v<16;++v)e[v]=t.readInt32BE(4*v);for(;v<64;++v)e[v]=p(e[v-2])+e[v-7]+l(e[v-15])+e[v-16]|0;for(var g=0;g<64;++g){var m=y+d(f)+c(f,s,b)+a[g]+e[g]|0,_=h(r)+u(r,n,i)|0;y=b,b=s,s=f,f=o+m|0,o=i,i=n,n=r,r=m+_|0}this._a=r+this._a|0,this._b=n+this._b|0,this._c=i+this._c|0,this._d=o+this._d|0,this._e=f+this._e|0,this._f=s+this._f|0,this._g=b+this._g|0,this._h=y+this._h|0},s.prototype._hash=function(){var t=o.allocUnsafe(32);return t.writeInt32BE(this._a,0),t.writeInt32BE(this._b,4),t.writeInt32BE(this._c,8),t.writeInt32BE(this._d,12),t.writeInt32BE(this._e,16),t.writeInt32BE(this._f,20),t.writeInt32BE(this._g,24),t.writeInt32BE(this._h,28),t},t.exports=s},function(t,e,r){var n=r(0),i=r(10),o=r(1).Buffer,a=[1116352408,3609767458,1899447441,602891725,3049323471,3964484399,3921009573,2173295548,961987163,4081628472,1508970993,3053834265,2453635748,2937671579,2870763221,3664609560,3624381080,2734883394,310598401,1164996542,607225278,1323610764,1426881987,3590304994,1925078388,4068182383,2162078206,991336113,2614888103,633803317,3248222580,3479774868,3835390401,2666613458,4022224774,944711139,264347078,2341262773,604807628,2007800933,770255983,1495990901,1249150122,1856431235,1555081692,3175218132,1996064986,2198950837,2554220882,3999719339,2821834349,766784016,2952996808,2566594879,3210313671,3203337956,3336571891,1034457026,3584528711,2466948901,113926993,3758326383,338241895,168717936,666307205,1188179964,773529912,1546045734,1294757372,1522805485,1396182291,2643833823,1695183700,2343527390,1986661051,1014477480,2177026350,1206759142,2456956037,344077627,2730485921,1290863460,2820302411,3158454273,3259730800,3505952657,3345764771,106217008,3516065817,3606008344,3600352804,1432725776,4094571909,1467031594,275423344,851169720,430227734,3100823752,506948616,1363258195,659060556,3750685593,883997877,3785050280,958139571,3318307427,1322822218,3812723403,1537002063,2003034995,1747873779,3602036899,1955562222,1575990012,2024104815,1125592928,2227730452,2716904306,2361852424,442776044,2428436474,593698344,2756734187,3733110249,3204031479,2999351573,3329325298,3815920427,3391569614,3928383900,3515267271,566280711,3940187606,3454069534,4118630271,4000239992,116418474,1914138554,174292421,2731055270,289380356,3203993006,460393269,320620315,685471733,587496836,852142971,1086792851,1017036298,365543100,1126000580,2618297676,1288033470,3409855158,1501505948,4234509866,1607167915,987167468,1816402316,1246189591],f=new Array(160);function s(){this.init(),this._w=f,i.call(this,128,112)}function c(t,e,r){return r^t&(e^r)}function u(t,e,r){return t&e|r&(t|e)}function h(t,e){return(t>>>28|e<<4)^(e>>>2|t<<30)^(e>>>7|t<<25)}function d(t,e){return(t>>>14|e<<18)^(t>>>18|e<<14)^(e>>>9|t<<23)}function l(t,e){return(t>>>1|e<<31)^(t>>>8|e<<24)^t>>>7}function p(t,e){return(t>>>1|e<<31)^(t>>>8|e<<24)^(t>>>7|e<<25)}function b(t,e){return(t>>>19|e<<13)^(e>>>29|t<<3)^t>>>6}function y(t,e){return(t>>>19|e<<13)^(e>>>29|t<<3)^(t>>>6|e<<26)}function v(t,e){return t>>>0<e>>>0?1:0}n(s,i),s.prototype.init=function(){return this._ah=1779033703,this._bh=3144134277,this._ch=1013904242,this._dh=2773480762,this._eh=1359893119,this._fh=2600822924,this._gh=528734635,this._hh=1541459225,this._al=4089235720,this._bl=2227873595,this._cl=4271175723,this._dl=1595750129,this._el=2917565137,this._fl=725511199,this._gl=4215389547,this._hl=327033209,this},s.prototype._update=function(t){for(var e=this._w,r=0|this._ah,n=0|this._bh,i=0|this._ch,o=0|this._dh,f=0|this._eh,s=0|this._fh,g=0|this._gh,m=0|this._hh,_=0|this._al,w=0|this._bl,S=0|this._cl,E=0|this._dl,M=0|this._el,A=0|this._fl,x=0|this._gl,k=0|this._hl,I=0;I<32;I+=2)e[I]=t.readInt32BE(4*I),e[I+1]=t.readInt32BE(4*I+4);for(;I<160;I+=2){var B=e[I-30],R=e[I-30+1],P=l(B,R),T=p(R,B),L=b(B=e[I-4],R=e[I-4+1]),O=y(R,B),C=e[I-14],j=e[I-14+1],N=e[I-32],D=e[I-32+1],U=T+j|0,q=P+C+v(U,T)|0;q=(q=q+L+v(U=U+O|0,O)|0)+N+v(U=U+D|0,D)|0,e[I]=q,e[I+1]=U}for(var z=0;z<160;z+=2){q=e[z],U=e[z+1];var F=u(r,n,i),K=u(_,w,S),Y=h(r,_),V=h(_,r),H=d(f,M),W=d(M,f),G=a[z],X=a[z+1],J=c(f,s,g),Z=c(M,A,x),$=k+W|0,Q=m+H+v($,k)|0;Q=(Q=(Q=Q+J+v($=$+Z|0,Z)|0)+G+v($=$+X|0,X)|0)+q+v($=$+U|0,U)|0;var tt=V+K|0,et=Y+F+v(tt,V)|0;m=g,k=x,g=s,x=A,s=f,A=M,f=o+Q+v(M=E+$|0,E)|0,o=i,E=S,i=n,S=w,n=r,w=_,r=Q+et+v(_=$+tt|0,$)|0}this._al=this._al+_|0,this._bl=this._bl+w|0,this._cl=this._cl+S|0,this._dl=this._dl+E|0,this._el=this._el+M|0,this._fl=this._fl+A|0,this._gl=this._gl+x|0,this._hl=this._hl+k|0,this._ah=this._ah+r+v(this._al,_)|0,this._bh=this._bh+n+v(this._bl,w)|0,this._ch=this._ch+i+v(this._cl,S)|0,this._dh=this._dh+o+v(this._dl,E)|0,this._eh=this._eh+f+v(this._el,M)|0,this._fh=this._fh+s+v(this._fl,A)|0,this._gh=this._gh+g+v(this._gl,x)|0,this._hh=this._hh+m+v(this._hl,k)|0},s.prototype._hash=function(){var t=o.allocUnsafe(64);function e(e,r,n){t.writeInt32BE(e,n),t.writeInt32BE(r,n+4)}return e(this._ah,this._al,0),e(this._bh,this._bl,8),e(this._ch,this._cl,16),e(this._dh,this._dl,24),e(this._eh,this._el,32),e(this._fh,this._fl,40),e(this._gh,this._gl,48),e(this._hh,this._hl,56),t},t.exports=s},function(t,e,r){"use strict";var n=e;function i(t){return 1===t.length?"0"+t:t}function o(t){for(var e="",r=0;r<t.length;r++)e+=i(t[r].toString(16));return e}n.toArray=function(t,e){if(Array.isArray(t))return t.slice();if(!t)return[];var r=[];if("string"!=typeof t){for(var n=0;n<t.length;n++)r[n]=0|t[n];return r}if("hex"===e)for((t=t.replace(/[^a-z0-9]+/gi,"")).length%2!=0&&(t="0"+t),n=0;n<t.length;n+=2)r.push(parseInt(t[n]+t[n+1],16));else for(n=0;n<t.length;n++){var i=t.charCodeAt(n),o=i>>8,a=255&i;o?r.push(o,a):r.push(a)}return r},n.zero2=i,n.toHex=o,n.encode=function(t,e){return"hex"===e?o(t):t}},function(t,e,r){"use strict";var n=r(5).rotr32;function i(t,e,r){return t&e^~t&r}function o(t,e,r){return t&e^t&r^e&r}function a(t,e,r){return t^e^r}e.ft_1=function(t,e,r,n){return 0===t?i(e,r,n):1===t||3===t?a(e,r,n):2===t?o(e,r,n):void 0},e.ch32=i,e.maj32=o,e.p32=a,e.s0_256=function(t){return n(t,2)^n(t,13)^n(t,22)},e.s1_256=function(t){return n(t,6)^n(t,11)^n(t,25)},e.g0_256=function(t){return n(t,7)^n(t,18)^t>>>3},e.g1_256=function(t){return n(t,17)^n(t,19)^t>>>10}},function(t,e,r){"use strict";var n=r(5),i=r(13),o=r(42),a=r(8),f=n.sum32,s=n.sum32_4,c=n.sum32_5,u=o.ch32,h=o.maj32,d=o.s0_256,l=o.s1_256,p=o.g0_256,b=o.g1_256,y=i.BlockHash,v=[1116352408,1899447441,3049323471,3921009573,961987163,1508970993,2453635748,2870763221,3624381080,310598401,607225278,1426881987,1925078388,2162078206,2614888103,3248222580,3835390401,4022224774,264347078,604807628,770255983,1249150122,1555081692,1996064986,2554220882,2821834349,2952996808,3210313671,3336571891,3584528711,113926993,338241895,666307205,773529912,1294757372,1396182291,1695183700,1986661051,2177026350,2456956037,2730485921,2820302411,3259730800,3345764771,3516065817,3600352804,4094571909,275423344,430227734,506948616,659060556,883997877,958139571,1322822218,1537002063,1747873779,1955562222,2024104815,2227730452,2361852424,2428436474,2756734187,3204031479,3329325298];function g(){if(!(this instanceof g))return new g;y.call(this),this.h=[1779033703,3144134277,1013904242,2773480762,1359893119,2600822924,528734635,1541459225],this.k=v,this.W=new Array(64)}n.inherits(g,y),t.exports=g,g.blockSize=512,g.outSize=256,g.hmacStrength=192,g.padLength=64,g.prototype._update=function(t,e){for(var r=this.W,n=0;n<16;n++)r[n]=t[e+n];for(;n<r.length;n++)r[n]=s(b(r[n-2]),r[n-7],p(r[n-15]),r[n-16]);var i=this.h[0],o=this.h[1],y=this.h[2],v=this.h[3],g=this.h[4],m=this.h[5],_=this.h[6],w=this.h[7];for(a(this.k.length===r.length),n=0;n<r.length;n++){var S=c(w,l(g),u(g,m,_),this.k[n],r[n]),E=f(d(i),h(i,o,y));w=_,_=m,m=g,g=f(v,S),v=y,y=o,o=i,i=f(S,E)}this.h[0]=f(this.h[0],i),this.h[1]=f(this.h[1],o),this.h[2]=f(this.h[2],y),this.h[3]=f(this.h[3],v),this.h[4]=f(this.h[4],g),this.h[5]=f(this.h[5],m),this.h[6]=f(this.h[6],_),this.h[7]=f(this.h[7],w)},g.prototype._digest=function(t){return"hex"===t?n.toHex32(this.h,"big"):n.split32(this.h,"big")}},function(t,e,r){"use strict";var n=r(5),i=r(13),o=r(8),a=n.rotr64_hi,f=n.rotr64_lo,s=n.shr64_hi,c=n.shr64_lo,u=n.sum64,h=n.sum64_hi,d=n.sum64_lo,l=n.sum64_4_hi,p=n.sum64_4_lo,b=n.sum64_5_hi,y=n.sum64_5_lo,v=i.BlockHash,g=[1116352408,3609767458,1899447441,602891725,3049323471,3964484399,3921009573,2173295548,961987163,4081628472,1508970993,3053834265,2453635748,2937671579,2870763221,3664609560,3624381080,2734883394,310598401,1164996542,607225278,1323610764,1426881987,3590304994,1925078388,4068182383,2162078206,991336113,2614888103,633803317,3248222580,3479774868,3835390401,2666613458,4022224774,944711139,264347078,2341262773,604807628,2007800933,770255983,1495990901,1249150122,1856431235,1555081692,3175218132,1996064986,2198950837,2554220882,3999719339,2821834349,766784016,2952996808,2566594879,3210313671,3203337956,3336571891,1034457026,3584528711,2466948901,113926993,3758326383,338241895,168717936,666307205,1188179964,773529912,1546045734,1294757372,1522805485,1396182291,2643833823,1695183700,2343527390,1986661051,1014477480,2177026350,1206759142,2456956037,344077627,2730485921,1290863460,2820302411,3158454273,3259730800,3505952657,3345764771,106217008,3516065817,3606008344,3600352804,1432725776,4094571909,1467031594,275423344,851169720,430227734,3100823752,506948616,1363258195,659060556,3750685593,883997877,3785050280,958139571,3318307427,1322822218,3812723403,1537002063,2003034995,1747873779,3602036899,1955562222,1575990012,2024104815,1125592928,2227730452,2716904306,2361852424,442776044,2428436474,593698344,2756734187,3733110249,3204031479,2999351573,3329325298,3815920427,3391569614,3928383900,3515267271,566280711,3940187606,3454069534,4118630271,4000239992,116418474,1914138554,174292421,2731055270,289380356,3203993006,460393269,320620315,685471733,587496836,852142971,1086792851,1017036298,365543100,1126000580,2618297676,1288033470,3409855158,1501505948,4234509866,1607167915,987167468,1816402316,1246189591];function m(){if(!(this instanceof m))return new m;v.call(this),this.h=[1779033703,4089235720,3144134277,2227873595,1013904242,4271175723,2773480762,1595750129,1359893119,2917565137,2600822924,725511199,528734635,4215389547,1541459225,327033209],this.k=g,this.W=new Array(160)}function _(t,e,r,n,i){var o=t&r^~t&i;return o<0&&(o+=4294967296),o}function w(t,e,r,n,i,o){var a=e&n^~e&o;return a<0&&(a+=4294967296),a}function S(t,e,r,n,i){var o=t&r^t&i^r&i;return o<0&&(o+=4294967296),o}function E(t,e,r,n,i,o){var a=e&n^e&o^n&o;return a<0&&(a+=4294967296),a}function M(t,e){var r=a(t,e,28)^a(e,t,2)^a(e,t,7);return r<0&&(r+=4294967296),r}function A(t,e){var r=f(t,e,28)^f(e,t,2)^f(e,t,7);return r<0&&(r+=4294967296),r}function x(t,e){var r=a(t,e,14)^a(t,e,18)^a(e,t,9);return r<0&&(r+=4294967296),r}function k(t,e){var r=f(t,e,14)^f(t,e,18)^f(e,t,9);return r<0&&(r+=4294967296),r}function I(t,e){var r=a(t,e,1)^a(t,e,8)^s(t,e,7);return r<0&&(r+=4294967296),r}function B(t,e){var r=f(t,e,1)^f(t,e,8)^c(t,e,7);return r<0&&(r+=4294967296),r}function R(t,e){var r=a(t,e,19)^a(e,t,29)^s(t,e,6);return r<0&&(r+=4294967296),r}function P(t,e){var r=f(t,e,19)^f(e,t,29)^c(t,e,6);return r<0&&(r+=4294967296),r}n.inherits(m,v),t.exports=m,m.blockSize=1024,m.outSize=512,m.hmacStrength=192,m.padLength=128,m.prototype._prepareBlock=function(t,e){for(var r=this.W,n=0;n<32;n++)r[n]=t[e+n];for(;n<r.length;n+=2){var i=R(r[n-4],r[n-3]),o=P(r[n-4],r[n-3]),a=r[n-14],f=r[n-13],s=I(r[n-30],r[n-29]),c=B(r[n-30],r[n-29]),u=r[n-32],h=r[n-31];r[n]=l(i,o,a,f,s,c,u,h),r[n+1]=p(i,o,a,f,s,c,u,h)}},m.prototype._update=function(t,e){this._prepareBlock(t,e);var r=this.W,n=this.h[0],i=this.h[1],a=this.h[2],f=this.h[3],s=this.h[4],c=this.h[5],l=this.h[6],p=this.h[7],v=this.h[8],g=this.h[9],m=this.h[10],I=this.h[11],B=this.h[12],R=this.h[13],P=this.h[14],T=this.h[15];o(this.k.length===r.length);for(var L=0;L<r.length;L+=2){var O=P,C=T,j=x(v,g),N=k(v,g),D=_(v,g,m,I,B),U=w(v,g,m,I,B,R),q=this.k[L],z=this.k[L+1],F=r[L],K=r[L+1],Y=b(O,C,j,N,D,U,q,z,F,K),V=y(O,C,j,N,D,U,q,z,F,K);O=M(n,i),C=A(n,i),j=S(n,i,a,f,s),N=E(n,i,a,f,s,c);var H=h(O,C,j,N),W=d(O,C,j,N);P=B,T=R,B=m,R=I,m=v,I=g,v=h(l,p,Y,V),g=d(p,p,Y,V),l=s,p=c,s=a,c=f,a=n,f=i,n=h(Y,V,H,W),i=d(Y,V,H,W)}u(this.h,0,n,i),u(this.h,2,a,f),u(this.h,4,s,c),u(this.h,6,l,p),u(this.h,8,v,g),u(this.h,10,m,I),u(this.h,12,B,R),u(this.h,14,P,T)},m.prototype._digest=function(t){return"hex"===t?n.toHex32(this.h,"big"):n.split32(this.h,"big")}},function(t,e,r){"use strict";(function(e){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
function n(t,e){if(t===e)return 0;for(var r=t.length,n=e.length,i=0,o=Math.min(r,n);i<o;++i)if(t[i]!==e[i]){r=t[i],n=e[i];break}return r<n?-1:n<r?1:0}function i(t){return e.Buffer&&"function"==typeof e.Buffer.isBuffer?e.Buffer.isBuffer(t):!(null==t||!t._isBuffer)}var o=r(15),a=Object.prototype.hasOwnProperty,f=Array.prototype.slice,s="foo"===function(){}.name;function c(t){return Object.prototype.toString.call(t)}function u(t){return!i(t)&&("function"==typeof e.ArrayBuffer&&("function"==typeof ArrayBuffer.isView?ArrayBuffer.isView(t):!!t&&(t instanceof DataView||!!(t.buffer&&t.buffer instanceof ArrayBuffer))))}var h=t.exports=v,d=/\s*function\s+([^\(\s]*)\s*/;function l(t){if(o.isFunction(t)){if(s)return t.name;var e=t.toString().match(d);return e&&e[1]}}function p(t,e){return"string"==typeof t?t.length<e?t:t.slice(0,e):t}function b(t){if(s||!o.isFunction(t))return o.inspect(t);var e=l(t);return"[Function"+(e?": "+e:"")+"]"}function y(t,e,r,n,i){throw new h.AssertionError({message:r,actual:t,expected:e,operator:n,stackStartFunction:i})}function v(t,e){t||y(t,!0,e,"==",h.ok)}function g(t,e,r,a){if(t===e)return!0;if(i(t)&&i(e))return 0===n(t,e);if(o.isDate(t)&&o.isDate(e))return t.getTime()===e.getTime();if(o.isRegExp(t)&&o.isRegExp(e))return t.source===e.source&&t.global===e.global&&t.multiline===e.multiline&&t.lastIndex===e.lastIndex&&t.ignoreCase===e.ignoreCase;if(null!==t&&"object"==typeof t||null!==e&&"object"==typeof e){if(u(t)&&u(e)&&c(t)===c(e)&&!(t instanceof Float32Array||t instanceof Float64Array))return 0===n(new Uint8Array(t.buffer),new Uint8Array(e.buffer));if(i(t)!==i(e))return!1;var s=(a=a||{actual:[],expected:[]}).actual.indexOf(t);return-1!==s&&s===a.expected.indexOf(e)||(a.actual.push(t),a.expected.push(e),function(t,e,r,n){if(null===t||void 0===t||null===e||void 0===e)return!1;if(o.isPrimitive(t)||o.isPrimitive(e))return t===e;if(r&&Object.getPrototypeOf(t)!==Object.getPrototypeOf(e))return!1;var i=m(t),a=m(e);if(i&&!a||!i&&a)return!1;if(i)return t=f.call(t),e=f.call(e),g(t,e,r);var s,c,u=S(t),h=S(e);if(u.length!==h.length)return!1;for(u.sort(),h.sort(),c=u.length-1;c>=0;c--)if(u[c]!==h[c])return!1;for(c=u.length-1;c>=0;c--)if(s=u[c],!g(t[s],e[s],r,n))return!1;return!0}(t,e,r,a))}return r?t===e:t==e}function m(t){return"[object Arguments]"==Object.prototype.toString.call(t)}function _(t,e){if(!t||!e)return!1;if("[object RegExp]"==Object.prototype.toString.call(e))return e.test(t);try{if(t instanceof e)return!0}catch(t){}return!Error.isPrototypeOf(e)&&!0===e.call({},t)}function w(t,e,r,n){var i;if("function"!=typeof e)throw new TypeError('"block" argument must be a function');"string"==typeof r&&(n=r,r=null),i=function(t){var e;try{t()}catch(t){e=t}return e}(e),n=(r&&r.name?" ("+r.name+").":".")+(n?" "+n:"."),t&&!i&&y(i,r,"Missing expected exception"+n);var a="string"==typeof n,f=!t&&o.isError(i),s=!t&&i&&!r;if((f&&a&&_(i,r)||s)&&y(i,r,"Got unwanted exception"+n),t&&i&&r&&!_(i,r)||!t&&i)throw i}h.AssertionError=function(t){this.name="AssertionError",this.actual=t.actual,this.expected=t.expected,this.operator=t.operator,t.message?(this.message=t.message,this.generatedMessage=!1):(this.message=function(t){return p(b(t.actual),128)+" "+t.operator+" "+p(b(t.expected),128)}(this),this.generatedMessage=!0);var e=t.stackStartFunction||y;if(Error.captureStackTrace)Error.captureStackTrace(this,e);else{var r=new Error;if(r.stack){var n=r.stack,i=l(e),o=n.indexOf("\n"+i);if(o>=0){var a=n.indexOf("\n",o+1);n=n.substring(a+1)}this.stack=n}}},o.inherits(h.AssertionError,Error),h.fail=y,h.ok=v,h.equal=function(t,e,r){t!=e&&y(t,e,r,"==",h.equal)},h.notEqual=function(t,e,r){t==e&&y(t,e,r,"!=",h.notEqual)},h.deepEqual=function(t,e,r){g(t,e,!1)||y(t,e,r,"deepEqual",h.deepEqual)},h.deepStrictEqual=function(t,e,r){g(t,e,!0)||y(t,e,r,"deepStrictEqual",h.deepStrictEqual)},h.notDeepEqual=function(t,e,r){g(t,e,!1)&&y(t,e,r,"notDeepEqual",h.notDeepEqual)},h.notDeepStrictEqual=function t(e,r,n){g(e,r,!0)&&y(e,r,n,"notDeepStrictEqual",t)},h.strictEqual=function(t,e,r){t!==e&&y(t,e,r,"===",h.strictEqual)},h.notStrictEqual=function(t,e,r){t===e&&y(t,e,r,"!==",h.notStrictEqual)},h.throws=function(t,e,r){w(!0,t,e,r)},h.doesNotThrow=function(t,e,r){w(!1,t,e,r)},h.ifError=function(t){if(t)throw t};var S=Object.keys||function(t){var e=[];for(var r in t)a.call(t,r)&&e.push(r);return e}}).call(this,r(4))},function(t,e,r){"use strict";(function(e){var n=r(47),i=r(123);function o(t){var e=t;if("string"!=typeof e)throw new Error("[ethjs-util] while padding to even, value must be string, is currently "+typeof e+", while padToEven.");return e.length%2&&(e="0"+e),e}function a(t){return"0x"+t.toString(16)}t.exports={arrayContainsArray:function(t,e,r){if(!0!==Array.isArray(t))throw new Error("[ethjs-util] method arrayContainsArray requires input 'superset' to be an array got type '"+typeof t+"'");if(!0!==Array.isArray(e))throw new Error("[ethjs-util] method arrayContainsArray requires input 'subset' to be an array got type '"+typeof e+"'");return e[Boolean(r)?"some":"every"](function(e){return t.indexOf(e)>=0})},intToBuffer:function(t){var r=a(t);return new e(o(r.slice(2)),"hex")},getBinarySize:function(t){if("string"!=typeof t)throw new Error("[ethjs-util] while getting binary size, method getBinarySize requires input 'str' to be type String, got '"+typeof t+"'.");return e.byteLength(t,"utf8")},isHexPrefixed:n,stripHexPrefix:i,padToEven:o,intToHex:a,fromAscii:function(t){for(var e="",r=0;r<t.length;r++){var n=t.charCodeAt(r).toString(16);e+=n.length<2?"0"+n:n}return"0x"+e},fromUtf8:function(t){return"0x"+o(new e(t,"utf8").toString("hex")).replace(/^0+|0+$/g,"")},toAscii:function(t){var e="",r=0,n=t.length;for("0x"===t.substring(0,2)&&(r=2);r<n;r+=2){var i=parseInt(t.substr(r,2),16);e+=String.fromCharCode(i)}return e},toUtf8:function(t){return new e(o(i(t).replace(/^0+|0+$/g,"")),"hex").toString("utf8")},getKeys:function(t,e,r){if(!Array.isArray(t))throw new Error("[ethjs-util] method getKeys expecting type Array as 'params' input, got '"+typeof t+"'");if("string"!=typeof e)throw new Error("[ethjs-util] method getKeys expecting type String for input 'key' got '"+typeof e+"'.");for(var n=[],i=0;i<t.length;i++){var o=t[i][e];if(r&&!o)o="";else if("string"!=typeof o)throw new Error("invalid abi");n.push(o)}return n},isHexString:function(t,e){return!("string"!=typeof t||!t.match(/^0x[0-9A-Fa-f]*$/)||e&&t.length!==2+2*e)}}}).call(this,r(11).Buffer)},function(t,e){t.exports=function(t){if("string"!=typeof t)throw new Error("[is-hex-prefixed] value must be type 'string', is currently type "+typeof t+", while checking isHexPrefixed.");return"0x"===t.slice(0,2)}},function(t,e,r){var n=r(49).Symbol;t.exports=n},function(t,e,r){var n=r(50),i="object"==typeof self&&self&&self.Object===Object&&self,o=n||i||Function("return this")();t.exports=o},function(t,e,r){(function(e){var r="object"==typeof e&&e&&e.Object===Object&&e;t.exports=r}).call(this,r(4))},function(t,e){t.exports=function(t){var e=typeof t;return null!=t&&("object"==e||"function"==e)}},function(t,e){var r=9007199254740991;t.exports=function(t){return"number"==typeof t&&t>-1&&t%1==0&&t<=r}},function(t,e,r){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.default={},t.exports=e.default},function(t,e,r){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.default=function(t){return function(e,r,s){if(s=(0,i.default)(s||n.default),t<=0||!e)return s(null);var c=(0,o.default)(e),u=!1,h=0,d=!1;function l(t,e){if(h-=1,t)u=!0,s(t);else{if(e===f.default||u&&h<=0)return u=!0,s(null);d||p()}}function p(){for(d=!0;h<t&&!u;){var e=c();if(null===e)return u=!0,void(h<=0&&s(null));h+=1,r(e.value,e.key,(0,a.default)(l))}d=!1}p()}};var n=s(r(27)),i=s(r(55)),o=s(r(136)),a=s(r(56)),f=s(r(53));function s(t){return t&&t.__esModule?t:{default:t}}t.exports=e.default},function(t,e,r){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.default=function(t){return function(){if(null!==t){var e=t;t=null,e.apply(this,arguments)}}},t.exports=e.default},function(t,e,r){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.default=function(t){return function(){if(null===t)throw new Error("Callback was already called.");var e=t;t=null,e.apply(this,arguments)}},t.exports=e.default},function(t,e,r){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.default=function(t,e){e|=0;for(var r=Math.max(t.length-e,0),n=Array(r),i=0;i<r;i++)n[i]=t[e+i];return n},t.exports=e.default},function(t,e,r){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.default=function(t,e){return function(r,n,i){return t(r,e,n,i)}},t.exports=e.default},function(t,e,r){const n=r(9).EventEmitter,i=r(15).inherits,o=r(65),a=r(124),f=r(129),s=r(159),c=r(162);r(163),r(29);function u(t){const e=this;n.call(e),e.setMaxListeners(30),t=t||{};const r={sendAsync:e._handleAsync.bind(e)},i=t.blockTrackerProvider||r;e._blockTracker=t.blockTracker||new a({provider:i,pollingInterval:t.pollingInterval||4e3}),e._blockTracker.on("block",t=>{const r=function(t){return{number:o.toBuffer(t.number),hash:o.toBuffer(t.hash),parentHash:o.toBuffer(t.parentHash),nonce:o.toBuffer(t.nonce),mixHash:o.toBuffer(t.mixHash),sha3Uncles:o.toBuffer(t.sha3Uncles),logsBloom:o.toBuffer(t.logsBloom),transactionsRoot:o.toBuffer(t.transactionsRoot),stateRoot:o.toBuffer(t.stateRoot),receiptsRoot:o.toBuffer(t.receiptRoot||t.receiptsRoot),miner:o.toBuffer(t.miner),difficulty:o.toBuffer(t.difficulty),totalDifficulty:o.toBuffer(t.totalDifficulty),size:o.toBuffer(t.size),extraData:o.toBuffer(t.extraData),gasLimit:o.toBuffer(t.gasLimit),gasUsed:o.toBuffer(t.gasUsed),timestamp:o.toBuffer(t.timestamp),transactions:t.transactions}}(t);e._setCurrentBlock(r)}),e._blockTracker.on("block",e.emit.bind(e,"rawBlock")),e._blockTracker.on("sync",e.emit.bind(e,"sync")),e._blockTracker.on("latest",e.emit.bind(e,"latest")),e._ready=new c,e._blockTracker.once("block",()=>{e._ready.go()}),e.currentBlock=null,e._providers=[]}t.exports=u,i(u,n),u.prototype.start=function(t=function(){}){this._blockTracker.start().then(t).catch(t)},u.prototype.stop=function(){this._blockTracker.stop()},u.prototype.addProvider=function(t){this._providers.push(t),t.setEngine(this)},u.prototype.send=function(t){throw new Error("Web3ProviderEngine does not support synchronous requests.")},u.prototype.sendAsync=function(t,e){const r=this;r._ready.await(function(){Array.isArray(t)?f(t,r._handleAsync.bind(r),e):r._handleAsync(t,e)})},u.prototype._handleAsync=function(t,e){var r=this,n=-1,i=null,o=null,a=[];function f(r,n){o=r,i=n,s(a,function(t,e){t?t(o,i,e):e()},function(){var r={id:t.id,jsonrpc:t.jsonrpc,result:i};null!=o?(r.error={message:o.stack||o.message||o,code:-32e3},e(o,r)):e(null,r)})}!function e(i){n+=1;a.unshift(i);if(n>=r._providers.length)f(new Error('Request for method "'+t.method+'" not handled by any subprovider. Please check your subprovider configuration to ensure this method is handled.'));else try{var o=r._providers[n];o.handleRequest(t,e,f)}catch(t){f(t)}}()},u.prototype._setCurrentBlock=function(t){this.currentBlock=t,this.emit("block",t)}},function(t,e,r){(function(e){const n=e.browser?r(169):r(176),i=r(15).inherits,o=r(29),a=r(177),f=r(178);function s(t){this.rpcUrl=t.rpcUrl}t.exports=s,i(s,a),s.prototype.handleRequest=function(t,e,r){const i=this.rpcUrl;let a=o(t);n({uri:i,method:"POST",headers:{Accept:"application/json","Content-Type":"application/json"},body:JSON.stringify(a),rejectUnauthorized:!1,timeout:2e4},function(t,e,n){if(t)return r(new f.InternalError(t));switch(e.statusCode){case 405:return r(new f.MethodNotFound);case 504:let t="Gateway timeout. The request took too long to process. ";const n=new Error(t+="This can happen when querying logs over too wide a block range.");return r(new f.InternalError(n));default:if(200!=e.statusCode)return r(new f.InternalError(e.body))}let i;try{i=JSON.parse(n)}catch(t){return console.error(t.stack),r(new f.InternalError(t))}if(i.error)return r(i.error);r(null,i.result)})}}).call(this,r(6))},function(module,exports){module.exports=function(t){var e={};function r(n){if(e[n])return e[n].exports;var i=e[n]={i:n,l:!1,exports:{}};return t[n].call(i.exports,i,i.exports,r),i.l=!0,i.exports}return r.m=t,r.c=e,r.d=function(t,e,n){r.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:n})},r.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},r.t=function(t,e){if(1&e&&(t=r(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var n=Object.create(null);if(r.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var i in t)r.d(n,i,function(e){return t[e]}.bind(null,i));return n},r.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return r.d(e,"a",e),e},r.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},r.p="",r(r.s=1)}([function(module,exports){module.exports=function(t){var e={};function r(n){if(e[n])return e[n].exports;var i=e[n]={i:n,l:!1,exports:{}};return t[n].call(i.exports,i,i.exports,r),i.l=!0,i.exports}return r.m=t,r.c=e,r.d=function(t,e,n){r.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:n})},r.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},r.t=function(t,e){if(1&e&&(t=r(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var n=Object.create(null);if(r.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var i in t)r.d(n,i,function(e){return t[e]}.bind(null,i));return n},r.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return r.d(e,"a",e),e},r.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},r.p="",r(r.s=73)}([function(t,e){"function"==typeof Object.create?t.exports=function(t,e){t.super_=e,t.prototype=Object.create(e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}})}:t.exports=function(t,e){t.super_=e;var r=function(){};r.prototype=e.prototype,t.prototype=new r,t.prototype.constructor=t}},function(t,e,r){var n=r(3),i=n.Buffer;function o(t,e){for(var r in t)e[r]=t[r]}function a(t,e,r){return i(t,e,r)}i.from&&i.alloc&&i.allocUnsafe&&i.allocUnsafeSlow?t.exports=n:(o(n,e),e.Buffer=a),o(i,a),a.from=function(t,e,r){if("number"==typeof t)throw new TypeError("Argument must not be a number");return i(t,e,r)},a.alloc=function(t,e,r){if("number"!=typeof t)throw new TypeError("Argument must be a number");var n=i(t);return void 0!==e?"string"==typeof r?n.fill(e,r):n.fill(e):n.fill(0),n},a.allocUnsafe=function(t){if("number"!=typeof t)throw new TypeError("Argument must be a number");return i(t)},a.allocUnsafeSlow=function(t){if("number"!=typeof t)throw new TypeError("Argument must be a number");return n.SlowBuffer(t)}},function(t,e,r){(function(t){!function(t,e){"use strict";function n(t,e){if(!t)throw new Error(e||"Assertion failed")}function i(t,e){t.super_=e;var r=function(){};r.prototype=e.prototype,t.prototype=new r,t.prototype.constructor=t}function o(t,e,r){if(o.isBN(t))return t;this.negative=0,this.words=null,this.length=0,this.red=null,null!==t&&("le"!==e&&"be"!==e||(r=e,e=10),this._init(t||0,e||10,r||"be"))}var a;"object"==typeof t?t.exports=o:e.BN=o,o.BN=o,o.wordSize=26;try{a=r(115).Buffer}catch(t){}function f(t,e,r){for(var n=0,i=Math.min(t.length,r),o=e;o<i;o++){var a=t.charCodeAt(o)-48;n<<=4,n|=a>=49&&a<=54?a-49+10:a>=17&&a<=22?a-17+10:15&a}return n}function s(t,e,r,n){for(var i=0,o=Math.min(t.length,r),a=e;a<o;a++){var f=t.charCodeAt(a)-48;i*=n,i+=f>=49?f-49+10:f>=17?f-17+10:f}return i}o.isBN=function(t){return t instanceof o||null!==t&&"object"==typeof t&&t.constructor.wordSize===o.wordSize&&Array.isArray(t.words)},o.max=function(t,e){return t.cmp(e)>0?t:e},o.min=function(t,e){return t.cmp(e)<0?t:e},o.prototype._init=function(t,e,r){if("number"==typeof t)return this._initNumber(t,e,r);if("object"==typeof t)return this._initArray(t,e,r);"hex"===e&&(e=16),n(e===(0|e)&&e>=2&&e<=36);var i=0;"-"===(t=t.toString().replace(/\s+/g,""))[0]&&i++,16===e?this._parseHex(t,i):this._parseBase(t,e,i),"-"===t[0]&&(this.negative=1),this.strip(),"le"===r&&this._initArray(this.toArray(),e,r)},o.prototype._initNumber=function(t,e,r){t<0&&(this.negative=1,t=-t),t<67108864?(this.words=[67108863&t],this.length=1):t<4503599627370496?(this.words=[67108863&t,t/67108864&67108863],this.length=2):(n(t<9007199254740992),this.words=[67108863&t,t/67108864&67108863,1],this.length=3),"le"===r&&this._initArray(this.toArray(),e,r)},o.prototype._initArray=function(t,e,r){if(n("number"==typeof t.length),t.length<=0)return this.words=[0],this.length=1,this;this.length=Math.ceil(t.length/3),this.words=new Array(this.length);for(var i=0;i<this.length;i++)this.words[i]=0;var o,a,f=0;if("be"===r)for(i=t.length-1,o=0;i>=0;i-=3)a=t[i]|t[i-1]<<8|t[i-2]<<16,this.words[o]|=a<<f&67108863,this.words[o+1]=a>>>26-f&67108863,(f+=24)>=26&&(f-=26,o++);else if("le"===r)for(i=0,o=0;i<t.length;i+=3)a=t[i]|t[i+1]<<8|t[i+2]<<16,this.words[o]|=a<<f&67108863,this.words[o+1]=a>>>26-f&67108863,(f+=24)>=26&&(f-=26,o++);return this.strip()},o.prototype._parseHex=function(t,e){this.length=Math.ceil((t.length-e)/6),this.words=new Array(this.length);for(var r=0;r<this.length;r++)this.words[r]=0;var n,i,o=0;for(r=t.length-6,n=0;r>=e;r-=6)i=f(t,r,r+6),this.words[n]|=i<<o&67108863,this.words[n+1]|=i>>>26-o&4194303,(o+=24)>=26&&(o-=26,n++);r+6!==e&&(i=f(t,e,r+6),this.words[n]|=i<<o&67108863,this.words[n+1]|=i>>>26-o&4194303),this.strip()},o.prototype._parseBase=function(t,e,r){this.words=[0],this.length=1;for(var n=0,i=1;i<=67108863;i*=e)n++;n--,i=i/e|0;for(var o=t.length-r,a=o%n,f=Math.min(o,o-a)+r,c=0,u=r;u<f;u+=n)c=s(t,u,u+n,e),this.imuln(i),this.words[0]+c<67108864?this.words[0]+=c:this._iaddn(c);if(0!==a){var h=1;for(c=s(t,u,t.length,e),u=0;u<a;u++)h*=e;this.imuln(h),this.words[0]+c<67108864?this.words[0]+=c:this._iaddn(c)}},o.prototype.copy=function(t){t.words=new Array(this.length);for(var e=0;e<this.length;e++)t.words[e]=this.words[e];t.length=this.length,t.negative=this.negative,t.red=this.red},o.prototype.clone=function(){var t=new o(null);return this.copy(t),t},o.prototype._expand=function(t){for(;this.length<t;)this.words[this.length++]=0;return this},o.prototype.strip=function(){for(;this.length>1&&0===this.words[this.length-1];)this.length--;return this._normSign()},o.prototype._normSign=function(){return 1===this.length&&0===this.words[0]&&(this.negative=0),this},o.prototype.inspect=function(){return(this.red?"<BN-R: ":"<BN: ")+this.toString(16)+">"};var c=["","0","00","000","0000","00000","000000","0000000","00000000","000000000","0000000000","00000000000","000000000000","0000000000000","00000000000000","000000000000000","0000000000000000","00000000000000000","000000000000000000","0000000000000000000","00000000000000000000","000000000000000000000","0000000000000000000000","00000000000000000000000","000000000000000000000000","0000000000000000000000000"],u=[0,0,25,16,12,11,10,9,8,8,7,7,7,7,6,6,6,6,6,6,6,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],h=[0,0,33554432,43046721,16777216,48828125,60466176,40353607,16777216,43046721,1e7,19487171,35831808,62748517,7529536,11390625,16777216,24137569,34012224,47045881,64e6,4084101,5153632,6436343,7962624,9765625,11881376,14348907,17210368,20511149,243e5,28629151,33554432,39135393,45435424,52521875,60466176];function d(t,e,r){r.negative=e.negative^t.negative;var n=t.length+e.length|0;r.length=n,n=n-1|0;var i=0|t.words[0],o=0|e.words[0],a=i*o,f=67108863&a,s=a/67108864|0;r.words[0]=f;for(var c=1;c<n;c++){for(var u=s>>>26,h=67108863&s,d=Math.min(c,e.length-1),l=Math.max(0,c-t.length+1);l<=d;l++){var p=c-l|0;u+=(a=(i=0|t.words[p])*(o=0|e.words[l])+h)/67108864|0,h=67108863&a}r.words[c]=0|h,s=0|u}return 0!==s?r.words[c]=0|s:r.length--,r.strip()}o.prototype.toString=function(t,e){var r;if(t=t||10,e=0|e||1,16===t||"hex"===t){r="";for(var i=0,o=0,a=0;a<this.length;a++){var f=this.words[a],s=(16777215&(f<<i|o)).toString(16);r=0!=(o=f>>>24-i&16777215)||a!==this.length-1?c[6-s.length]+s+r:s+r,(i+=2)>=26&&(i-=26,a--)}for(0!==o&&(r=o.toString(16)+r);r.length%e!=0;)r="0"+r;return 0!==this.negative&&(r="-"+r),r}if(t===(0|t)&&t>=2&&t<=36){var d=u[t],l=h[t];r="";var p=this.clone();for(p.negative=0;!p.isZero();){var b=p.modn(l).toString(t);r=(p=p.idivn(l)).isZero()?b+r:c[d-b.length]+b+r}for(this.isZero()&&(r="0"+r);r.length%e!=0;)r="0"+r;return 0!==this.negative&&(r="-"+r),r}n(!1,"Base should be between 2 and 36")},o.prototype.toNumber=function(){var t=this.words[0];return 2===this.length?t+=67108864*this.words[1]:3===this.length&&1===this.words[2]?t+=4503599627370496+67108864*this.words[1]:this.length>2&&n(!1,"Number can only safely store up to 53 bits"),0!==this.negative?-t:t},o.prototype.toJSON=function(){return this.toString(16)},o.prototype.toBuffer=function(t,e){return n(void 0!==a),this.toArrayLike(a,t,e)},o.prototype.toArray=function(t,e){return this.toArrayLike(Array,t,e)},o.prototype.toArrayLike=function(t,e,r){var i=this.byteLength(),o=r||Math.max(1,i);n(i<=o,"byte array longer than desired length"),n(o>0,"Requested array length <= 0"),this.strip();var a,f,s="le"===e,c=new t(o),u=this.clone();if(s){for(f=0;!u.isZero();f++)a=u.andln(255),u.iushrn(8),c[f]=a;for(;f<o;f++)c[f]=0}else{for(f=0;f<o-i;f++)c[f]=0;for(f=0;!u.isZero();f++)a=u.andln(255),u.iushrn(8),c[o-f-1]=a}return c},Math.clz32?o.prototype._countBits=function(t){return 32-Math.clz32(t)}:o.prototype._countBits=function(t){var e=t,r=0;return e>=4096&&(r+=13,e>>>=13),e>=64&&(r+=7,e>>>=7),e>=8&&(r+=4,e>>>=4),e>=2&&(r+=2,e>>>=2),r+e},o.prototype._zeroBits=function(t){if(0===t)return 26;var e=t,r=0;return 0==(8191&e)&&(r+=13,e>>>=13),0==(127&e)&&(r+=7,e>>>=7),0==(15&e)&&(r+=4,e>>>=4),0==(3&e)&&(r+=2,e>>>=2),0==(1&e)&&r++,r},o.prototype.bitLength=function(){var t=this.words[this.length-1],e=this._countBits(t);return 26*(this.length-1)+e},o.prototype.zeroBits=function(){if(this.isZero())return 0;for(var t=0,e=0;e<this.length;e++){var r=this._zeroBits(this.words[e]);if(t+=r,26!==r)break}return t},o.prototype.byteLength=function(){return Math.ceil(this.bitLength()/8)},o.prototype.toTwos=function(t){return 0!==this.negative?this.abs().inotn(t).iaddn(1):this.clone()},o.prototype.fromTwos=function(t){return this.testn(t-1)?this.notn(t).iaddn(1).ineg():this.clone()},o.prototype.isNeg=function(){return 0!==this.negative},o.prototype.neg=function(){return this.clone().ineg()},o.prototype.ineg=function(){return this.isZero()||(this.negative^=1),this},o.prototype.iuor=function(t){for(;this.length<t.length;)this.words[this.length++]=0;for(var e=0;e<t.length;e++)this.words[e]=this.words[e]|t.words[e];return this.strip()},o.prototype.ior=function(t){return n(0==(this.negative|t.negative)),this.iuor(t)},o.prototype.or=function(t){return this.length>t.length?this.clone().ior(t):t.clone().ior(this)},o.prototype.uor=function(t){return this.length>t.length?this.clone().iuor(t):t.clone().iuor(this)},o.prototype.iuand=function(t){var e;e=this.length>t.length?t:this;for(var r=0;r<e.length;r++)this.words[r]=this.words[r]&t.words[r];return this.length=e.length,this.strip()},o.prototype.iand=function(t){return n(0==(this.negative|t.negative)),this.iuand(t)},o.prototype.and=function(t){return this.length>t.length?this.clone().iand(t):t.clone().iand(this)},o.prototype.uand=function(t){return this.length>t.length?this.clone().iuand(t):t.clone().iuand(this)},o.prototype.iuxor=function(t){var e,r;this.length>t.length?(e=this,r=t):(e=t,r=this);for(var n=0;n<r.length;n++)this.words[n]=e.words[n]^r.words[n];if(this!==e)for(;n<e.length;n++)this.words[n]=e.words[n];return this.length=e.length,this.strip()},o.prototype.ixor=function(t){return n(0==(this.negative|t.negative)),this.iuxor(t)},o.prototype.xor=function(t){return this.length>t.length?this.clone().ixor(t):t.clone().ixor(this)},o.prototype.uxor=function(t){return this.length>t.length?this.clone().iuxor(t):t.clone().iuxor(this)},o.prototype.inotn=function(t){n("number"==typeof t&&t>=0);var e=0|Math.ceil(t/26),r=t%26;this._expand(e),r>0&&e--;for(var i=0;i<e;i++)this.words[i]=67108863&~this.words[i];return r>0&&(this.words[i]=~this.words[i]&67108863>>26-r),this.strip()},o.prototype.notn=function(t){return this.clone().inotn(t)},o.prototype.setn=function(t,e){n("number"==typeof t&&t>=0);var r=t/26|0,i=t%26;return this._expand(r+1),this.words[r]=e?this.words[r]|1<<i:this.words[r]&~(1<<i),this.strip()},o.prototype.iadd=function(t){var e,r,n;if(0!==this.negative&&0===t.negative)return this.negative=0,e=this.isub(t),this.negative^=1,this._normSign();if(0===this.negative&&0!==t.negative)return t.negative=0,e=this.isub(t),t.negative=1,e._normSign();this.length>t.length?(r=this,n=t):(r=t,n=this);for(var i=0,o=0;o<n.length;o++)e=(0|r.words[o])+(0|n.words[o])+i,this.words[o]=67108863&e,i=e>>>26;for(;0!==i&&o<r.length;o++)e=(0|r.words[o])+i,this.words[o]=67108863&e,i=e>>>26;if(this.length=r.length,0!==i)this.words[this.length]=i,this.length++;else if(r!==this)for(;o<r.length;o++)this.words[o]=r.words[o];return this},o.prototype.add=function(t){var e;return 0!==t.negative&&0===this.negative?(t.negative=0,e=this.sub(t),t.negative^=1,e):0===t.negative&&0!==this.negative?(this.negative=0,e=t.sub(this),this.negative=1,e):this.length>t.length?this.clone().iadd(t):t.clone().iadd(this)},o.prototype.isub=function(t){if(0!==t.negative){t.negative=0;var e=this.iadd(t);return t.negative=1,e._normSign()}if(0!==this.negative)return this.negative=0,this.iadd(t),this.negative=1,this._normSign();var r,n,i=this.cmp(t);if(0===i)return this.negative=0,this.length=1,this.words[0]=0,this;i>0?(r=this,n=t):(r=t,n=this);for(var o=0,a=0;a<n.length;a++)o=(e=(0|r.words[a])-(0|n.words[a])+o)>>26,this.words[a]=67108863&e;for(;0!==o&&a<r.length;a++)o=(e=(0|r.words[a])+o)>>26,this.words[a]=67108863&e;if(0===o&&a<r.length&&r!==this)for(;a<r.length;a++)this.words[a]=r.words[a];return this.length=Math.max(this.length,a),r!==this&&(this.negative=1),this.strip()},o.prototype.sub=function(t){return this.clone().isub(t)};var l=function(t,e,r){var n,i,o,a=t.words,f=e.words,s=r.words,c=0,u=0|a[0],h=8191&u,d=u>>>13,l=0|a[1],p=8191&l,b=l>>>13,y=0|a[2],v=8191&y,g=y>>>13,m=0|a[3],_=8191&m,w=m>>>13,S=0|a[4],E=8191&S,M=S>>>13,A=0|a[5],x=8191&A,k=A>>>13,I=0|a[6],B=8191&I,R=I>>>13,P=0|a[7],T=8191&P,L=P>>>13,O=0|a[8],C=8191&O,j=O>>>13,N=0|a[9],D=8191&N,U=N>>>13,q=0|f[0],z=8191&q,F=q>>>13,K=0|f[1],Y=8191&K,V=K>>>13,H=0|f[2],W=8191&H,G=H>>>13,X=0|f[3],J=8191&X,Z=X>>>13,$=0|f[4],Q=8191&$,tt=$>>>13,et=0|f[5],rt=8191&et,nt=et>>>13,it=0|f[6],ot=8191&it,at=it>>>13,ft=0|f[7],st=8191&ft,ct=ft>>>13,ut=0|f[8],ht=8191&ut,dt=ut>>>13,lt=0|f[9],pt=8191&lt,bt=lt>>>13;r.negative=t.negative^e.negative,r.length=19;var yt=(c+(n=Math.imul(h,z))|0)+((8191&(i=(i=Math.imul(h,F))+Math.imul(d,z)|0))<<13)|0;c=((o=Math.imul(d,F))+(i>>>13)|0)+(yt>>>26)|0,yt&=67108863,n=Math.imul(p,z),i=(i=Math.imul(p,F))+Math.imul(b,z)|0,o=Math.imul(b,F);var vt=(c+(n=n+Math.imul(h,Y)|0)|0)+((8191&(i=(i=i+Math.imul(h,V)|0)+Math.imul(d,Y)|0))<<13)|0;c=((o=o+Math.imul(d,V)|0)+(i>>>13)|0)+(vt>>>26)|0,vt&=67108863,n=Math.imul(v,z),i=(i=Math.imul(v,F))+Math.imul(g,z)|0,o=Math.imul(g,F),n=n+Math.imul(p,Y)|0,i=(i=i+Math.imul(p,V)|0)+Math.imul(b,Y)|0,o=o+Math.imul(b,V)|0;var gt=(c+(n=n+Math.imul(h,W)|0)|0)+((8191&(i=(i=i+Math.imul(h,G)|0)+Math.imul(d,W)|0))<<13)|0;c=((o=o+Math.imul(d,G)|0)+(i>>>13)|0)+(gt>>>26)|0,gt&=67108863,n=Math.imul(_,z),i=(i=Math.imul(_,F))+Math.imul(w,z)|0,o=Math.imul(w,F),n=n+Math.imul(v,Y)|0,i=(i=i+Math.imul(v,V)|0)+Math.imul(g,Y)|0,o=o+Math.imul(g,V)|0,n=n+Math.imul(p,W)|0,i=(i=i+Math.imul(p,G)|0)+Math.imul(b,W)|0,o=o+Math.imul(b,G)|0;var mt=(c+(n=n+Math.imul(h,J)|0)|0)+((8191&(i=(i=i+Math.imul(h,Z)|0)+Math.imul(d,J)|0))<<13)|0;c=((o=o+Math.imul(d,Z)|0)+(i>>>13)|0)+(mt>>>26)|0,mt&=67108863,n=Math.imul(E,z),i=(i=Math.imul(E,F))+Math.imul(M,z)|0,o=Math.imul(M,F),n=n+Math.imul(_,Y)|0,i=(i=i+Math.imul(_,V)|0)+Math.imul(w,Y)|0,o=o+Math.imul(w,V)|0,n=n+Math.imul(v,W)|0,i=(i=i+Math.imul(v,G)|0)+Math.imul(g,W)|0,o=o+Math.imul(g,G)|0,n=n+Math.imul(p,J)|0,i=(i=i+Math.imul(p,Z)|0)+Math.imul(b,J)|0,o=o+Math.imul(b,Z)|0;var _t=(c+(n=n+Math.imul(h,Q)|0)|0)+((8191&(i=(i=i+Math.imul(h,tt)|0)+Math.imul(d,Q)|0))<<13)|0;c=((o=o+Math.imul(d,tt)|0)+(i>>>13)|0)+(_t>>>26)|0,_t&=67108863,n=Math.imul(x,z),i=(i=Math.imul(x,F))+Math.imul(k,z)|0,o=Math.imul(k,F),n=n+Math.imul(E,Y)|0,i=(i=i+Math.imul(E,V)|0)+Math.imul(M,Y)|0,o=o+Math.imul(M,V)|0,n=n+Math.imul(_,W)|0,i=(i=i+Math.imul(_,G)|0)+Math.imul(w,W)|0,o=o+Math.imul(w,G)|0,n=n+Math.imul(v,J)|0,i=(i=i+Math.imul(v,Z)|0)+Math.imul(g,J)|0,o=o+Math.imul(g,Z)|0,n=n+Math.imul(p,Q)|0,i=(i=i+Math.imul(p,tt)|0)+Math.imul(b,Q)|0,o=o+Math.imul(b,tt)|0;var wt=(c+(n=n+Math.imul(h,rt)|0)|0)+((8191&(i=(i=i+Math.imul(h,nt)|0)+Math.imul(d,rt)|0))<<13)|0;c=((o=o+Math.imul(d,nt)|0)+(i>>>13)|0)+(wt>>>26)|0,wt&=67108863,n=Math.imul(B,z),i=(i=Math.imul(B,F))+Math.imul(R,z)|0,o=Math.imul(R,F),n=n+Math.imul(x,Y)|0,i=(i=i+Math.imul(x,V)|0)+Math.imul(k,Y)|0,o=o+Math.imul(k,V)|0,n=n+Math.imul(E,W)|0,i=(i=i+Math.imul(E,G)|0)+Math.imul(M,W)|0,o=o+Math.imul(M,G)|0,n=n+Math.imul(_,J)|0,i=(i=i+Math.imul(_,Z)|0)+Math.imul(w,J)|0,o=o+Math.imul(w,Z)|0,n=n+Math.imul(v,Q)|0,i=(i=i+Math.imul(v,tt)|0)+Math.imul(g,Q)|0,o=o+Math.imul(g,tt)|0,n=n+Math.imul(p,rt)|0,i=(i=i+Math.imul(p,nt)|0)+Math.imul(b,rt)|0,o=o+Math.imul(b,nt)|0;var St=(c+(n=n+Math.imul(h,ot)|0)|0)+((8191&(i=(i=i+Math.imul(h,at)|0)+Math.imul(d,ot)|0))<<13)|0;c=((o=o+Math.imul(d,at)|0)+(i>>>13)|0)+(St>>>26)|0,St&=67108863,n=Math.imul(T,z),i=(i=Math.imul(T,F))+Math.imul(L,z)|0,o=Math.imul(L,F),n=n+Math.imul(B,Y)|0,i=(i=i+Math.imul(B,V)|0)+Math.imul(R,Y)|0,o=o+Math.imul(R,V)|0,n=n+Math.imul(x,W)|0,i=(i=i+Math.imul(x,G)|0)+Math.imul(k,W)|0,o=o+Math.imul(k,G)|0,n=n+Math.imul(E,J)|0,i=(i=i+Math.imul(E,Z)|0)+Math.imul(M,J)|0,o=o+Math.imul(M,Z)|0,n=n+Math.imul(_,Q)|0,i=(i=i+Math.imul(_,tt)|0)+Math.imul(w,Q)|0,o=o+Math.imul(w,tt)|0,n=n+Math.imul(v,rt)|0,i=(i=i+Math.imul(v,nt)|0)+Math.imul(g,rt)|0,o=o+Math.imul(g,nt)|0,n=n+Math.imul(p,ot)|0,i=(i=i+Math.imul(p,at)|0)+Math.imul(b,ot)|0,o=o+Math.imul(b,at)|0;var Et=(c+(n=n+Math.imul(h,st)|0)|0)+((8191&(i=(i=i+Math.imul(h,ct)|0)+Math.imul(d,st)|0))<<13)|0;c=((o=o+Math.imul(d,ct)|0)+(i>>>13)|0)+(Et>>>26)|0,Et&=67108863,n=Math.imul(C,z),i=(i=Math.imul(C,F))+Math.imul(j,z)|0,o=Math.imul(j,F),n=n+Math.imul(T,Y)|0,i=(i=i+Math.imul(T,V)|0)+Math.imul(L,Y)|0,o=o+Math.imul(L,V)|0,n=n+Math.imul(B,W)|0,i=(i=i+Math.imul(B,G)|0)+Math.imul(R,W)|0,o=o+Math.imul(R,G)|0,n=n+Math.imul(x,J)|0,i=(i=i+Math.imul(x,Z)|0)+Math.imul(k,J)|0,o=o+Math.imul(k,Z)|0,n=n+Math.imul(E,Q)|0,i=(i=i+Math.imul(E,tt)|0)+Math.imul(M,Q)|0,o=o+Math.imul(M,tt)|0,n=n+Math.imul(_,rt)|0,i=(i=i+Math.imul(_,nt)|0)+Math.imul(w,rt)|0,o=o+Math.imul(w,nt)|0,n=n+Math.imul(v,ot)|0,i=(i=i+Math.imul(v,at)|0)+Math.imul(g,ot)|0,o=o+Math.imul(g,at)|0,n=n+Math.imul(p,st)|0,i=(i=i+Math.imul(p,ct)|0)+Math.imul(b,st)|0,o=o+Math.imul(b,ct)|0;var Mt=(c+(n=n+Math.imul(h,ht)|0)|0)+((8191&(i=(i=i+Math.imul(h,dt)|0)+Math.imul(d,ht)|0))<<13)|0;c=((o=o+Math.imul(d,dt)|0)+(i>>>13)|0)+(Mt>>>26)|0,Mt&=67108863,n=Math.imul(D,z),i=(i=Math.imul(D,F))+Math.imul(U,z)|0,o=Math.imul(U,F),n=n+Math.imul(C,Y)|0,i=(i=i+Math.imul(C,V)|0)+Math.imul(j,Y)|0,o=o+Math.imul(j,V)|0,n=n+Math.imul(T,W)|0,i=(i=i+Math.imul(T,G)|0)+Math.imul(L,W)|0,o=o+Math.imul(L,G)|0,n=n+Math.imul(B,J)|0,i=(i=i+Math.imul(B,Z)|0)+Math.imul(R,J)|0,o=o+Math.imul(R,Z)|0,n=n+Math.imul(x,Q)|0,i=(i=i+Math.imul(x,tt)|0)+Math.imul(k,Q)|0,o=o+Math.imul(k,tt)|0,n=n+Math.imul(E,rt)|0,i=(i=i+Math.imul(E,nt)|0)+Math.imul(M,rt)|0,o=o+Math.imul(M,nt)|0,n=n+Math.imul(_,ot)|0,i=(i=i+Math.imul(_,at)|0)+Math.imul(w,ot)|0,o=o+Math.imul(w,at)|0,n=n+Math.imul(v,st)|0,i=(i=i+Math.imul(v,ct)|0)+Math.imul(g,st)|0,o=o+Math.imul(g,ct)|0,n=n+Math.imul(p,ht)|0,i=(i=i+Math.imul(p,dt)|0)+Math.imul(b,ht)|0,o=o+Math.imul(b,dt)|0;var At=(c+(n=n+Math.imul(h,pt)|0)|0)+((8191&(i=(i=i+Math.imul(h,bt)|0)+Math.imul(d,pt)|0))<<13)|0;c=((o=o+Math.imul(d,bt)|0)+(i>>>13)|0)+(At>>>26)|0,At&=67108863,n=Math.imul(D,Y),i=(i=Math.imul(D,V))+Math.imul(U,Y)|0,o=Math.imul(U,V),n=n+Math.imul(C,W)|0,i=(i=i+Math.imul(C,G)|0)+Math.imul(j,W)|0,o=o+Math.imul(j,G)|0,n=n+Math.imul(T,J)|0,i=(i=i+Math.imul(T,Z)|0)+Math.imul(L,J)|0,o=o+Math.imul(L,Z)|0,n=n+Math.imul(B,Q)|0,i=(i=i+Math.imul(B,tt)|0)+Math.imul(R,Q)|0,o=o+Math.imul(R,tt)|0,n=n+Math.imul(x,rt)|0,i=(i=i+Math.imul(x,nt)|0)+Math.imul(k,rt)|0,o=o+Math.imul(k,nt)|0,n=n+Math.imul(E,ot)|0,i=(i=i+Math.imul(E,at)|0)+Math.imul(M,ot)|0,o=o+Math.imul(M,at)|0,n=n+Math.imul(_,st)|0,i=(i=i+Math.imul(_,ct)|0)+Math.imul(w,st)|0,o=o+Math.imul(w,ct)|0,n=n+Math.imul(v,ht)|0,i=(i=i+Math.imul(v,dt)|0)+Math.imul(g,ht)|0,o=o+Math.imul(g,dt)|0;var xt=(c+(n=n+Math.imul(p,pt)|0)|0)+((8191&(i=(i=i+Math.imul(p,bt)|0)+Math.imul(b,pt)|0))<<13)|0;c=((o=o+Math.imul(b,bt)|0)+(i>>>13)|0)+(xt>>>26)|0,xt&=67108863,n=Math.imul(D,W),i=(i=Math.imul(D,G))+Math.imul(U,W)|0,o=Math.imul(U,G),n=n+Math.imul(C,J)|0,i=(i=i+Math.imul(C,Z)|0)+Math.imul(j,J)|0,o=o+Math.imul(j,Z)|0,n=n+Math.imul(T,Q)|0,i=(i=i+Math.imul(T,tt)|0)+Math.imul(L,Q)|0,o=o+Math.imul(L,tt)|0,n=n+Math.imul(B,rt)|0,i=(i=i+Math.imul(B,nt)|0)+Math.imul(R,rt)|0,o=o+Math.imul(R,nt)|0,n=n+Math.imul(x,ot)|0,i=(i=i+Math.imul(x,at)|0)+Math.imul(k,ot)|0,o=o+Math.imul(k,at)|0,n=n+Math.imul(E,st)|0,i=(i=i+Math.imul(E,ct)|0)+Math.imul(M,st)|0,o=o+Math.imul(M,ct)|0,n=n+Math.imul(_,ht)|0,i=(i=i+Math.imul(_,dt)|0)+Math.imul(w,ht)|0,o=o+Math.imul(w,dt)|0;var kt=(c+(n=n+Math.imul(v,pt)|0)|0)+((8191&(i=(i=i+Math.imul(v,bt)|0)+Math.imul(g,pt)|0))<<13)|0;c=((o=o+Math.imul(g,bt)|0)+(i>>>13)|0)+(kt>>>26)|0,kt&=67108863,n=Math.imul(D,J),i=(i=Math.imul(D,Z))+Math.imul(U,J)|0,o=Math.imul(U,Z),n=n+Math.imul(C,Q)|0,i=(i=i+Math.imul(C,tt)|0)+Math.imul(j,Q)|0,o=o+Math.imul(j,tt)|0,n=n+Math.imul(T,rt)|0,i=(i=i+Math.imul(T,nt)|0)+Math.imul(L,rt)|0,o=o+Math.imul(L,nt)|0,n=n+Math.imul(B,ot)|0,i=(i=i+Math.imul(B,at)|0)+Math.imul(R,ot)|0,o=o+Math.imul(R,at)|0,n=n+Math.imul(x,st)|0,i=(i=i+Math.imul(x,ct)|0)+Math.imul(k,st)|0,o=o+Math.imul(k,ct)|0,n=n+Math.imul(E,ht)|0,i=(i=i+Math.imul(E,dt)|0)+Math.imul(M,ht)|0,o=o+Math.imul(M,dt)|0;var It=(c+(n=n+Math.imul(_,pt)|0)|0)+((8191&(i=(i=i+Math.imul(_,bt)|0)+Math.imul(w,pt)|0))<<13)|0;c=((o=o+Math.imul(w,bt)|0)+(i>>>13)|0)+(It>>>26)|0,It&=67108863,n=Math.imul(D,Q),i=(i=Math.imul(D,tt))+Math.imul(U,Q)|0,o=Math.imul(U,tt),n=n+Math.imul(C,rt)|0,i=(i=i+Math.imul(C,nt)|0)+Math.imul(j,rt)|0,o=o+Math.imul(j,nt)|0,n=n+Math.imul(T,ot)|0,i=(i=i+Math.imul(T,at)|0)+Math.imul(L,ot)|0,o=o+Math.imul(L,at)|0,n=n+Math.imul(B,st)|0,i=(i=i+Math.imul(B,ct)|0)+Math.imul(R,st)|0,o=o+Math.imul(R,ct)|0,n=n+Math.imul(x,ht)|0,i=(i=i+Math.imul(x,dt)|0)+Math.imul(k,ht)|0,o=o+Math.imul(k,dt)|0;var Bt=(c+(n=n+Math.imul(E,pt)|0)|0)+((8191&(i=(i=i+Math.imul(E,bt)|0)+Math.imul(M,pt)|0))<<13)|0;c=((o=o+Math.imul(M,bt)|0)+(i>>>13)|0)+(Bt>>>26)|0,Bt&=67108863,n=Math.imul(D,rt),i=(i=Math.imul(D,nt))+Math.imul(U,rt)|0,o=Math.imul(U,nt),n=n+Math.imul(C,ot)|0,i=(i=i+Math.imul(C,at)|0)+Math.imul(j,ot)|0,o=o+Math.imul(j,at)|0,n=n+Math.imul(T,st)|0,i=(i=i+Math.imul(T,ct)|0)+Math.imul(L,st)|0,o=o+Math.imul(L,ct)|0,n=n+Math.imul(B,ht)|0,i=(i=i+Math.imul(B,dt)|0)+Math.imul(R,ht)|0,o=o+Math.imul(R,dt)|0;var Rt=(c+(n=n+Math.imul(x,pt)|0)|0)+((8191&(i=(i=i+Math.imul(x,bt)|0)+Math.imul(k,pt)|0))<<13)|0;c=((o=o+Math.imul(k,bt)|0)+(i>>>13)|0)+(Rt>>>26)|0,Rt&=67108863,n=Math.imul(D,ot),i=(i=Math.imul(D,at))+Math.imul(U,ot)|0,o=Math.imul(U,at),n=n+Math.imul(C,st)|0,i=(i=i+Math.imul(C,ct)|0)+Math.imul(j,st)|0,o=o+Math.imul(j,ct)|0,n=n+Math.imul(T,ht)|0,i=(i=i+Math.imul(T,dt)|0)+Math.imul(L,ht)|0,o=o+Math.imul(L,dt)|0;var Pt=(c+(n=n+Math.imul(B,pt)|0)|0)+((8191&(i=(i=i+Math.imul(B,bt)|0)+Math.imul(R,pt)|0))<<13)|0;c=((o=o+Math.imul(R,bt)|0)+(i>>>13)|0)+(Pt>>>26)|0,Pt&=67108863,n=Math.imul(D,st),i=(i=Math.imul(D,ct))+Math.imul(U,st)|0,o=Math.imul(U,ct),n=n+Math.imul(C,ht)|0,i=(i=i+Math.imul(C,dt)|0)+Math.imul(j,ht)|0,o=o+Math.imul(j,dt)|0;var Tt=(c+(n=n+Math.imul(T,pt)|0)|0)+((8191&(i=(i=i+Math.imul(T,bt)|0)+Math.imul(L,pt)|0))<<13)|0;c=((o=o+Math.imul(L,bt)|0)+(i>>>13)|0)+(Tt>>>26)|0,Tt&=67108863,n=Math.imul(D,ht),i=(i=Math.imul(D,dt))+Math.imul(U,ht)|0,o=Math.imul(U,dt);var Lt=(c+(n=n+Math.imul(C,pt)|0)|0)+((8191&(i=(i=i+Math.imul(C,bt)|0)+Math.imul(j,pt)|0))<<13)|0;c=((o=o+Math.imul(j,bt)|0)+(i>>>13)|0)+(Lt>>>26)|0,Lt&=67108863;var Ot=(c+(n=Math.imul(D,pt))|0)+((8191&(i=(i=Math.imul(D,bt))+Math.imul(U,pt)|0))<<13)|0;return c=((o=Math.imul(U,bt))+(i>>>13)|0)+(Ot>>>26)|0,Ot&=67108863,s[0]=yt,s[1]=vt,s[2]=gt,s[3]=mt,s[4]=_t,s[5]=wt,s[6]=St,s[7]=Et,s[8]=Mt,s[9]=At,s[10]=xt,s[11]=kt,s[12]=It,s[13]=Bt,s[14]=Rt,s[15]=Pt,s[16]=Tt,s[17]=Lt,s[18]=Ot,0!==c&&(s[19]=c,r.length++),r};function p(t,e,r){return(new b).mulp(t,e,r)}function b(t,e){this.x=t,this.y=e}Math.imul||(l=d),o.prototype.mulTo=function(t,e){var r=this.length+t.length;return 10===this.length&&10===t.length?l(this,t,e):r<63?d(this,t,e):r<1024?function(t,e,r){r.negative=e.negative^t.negative,r.length=t.length+e.length;for(var n=0,i=0,o=0;o<r.length-1;o++){var a=i;i=0;for(var f=67108863&n,s=Math.min(o,e.length-1),c=Math.max(0,o-t.length+1);c<=s;c++){var u=o-c,h=(0|t.words[u])*(0|e.words[c]),d=67108863&h;f=67108863&(d=d+f|0),i+=(a=(a=a+(h/67108864|0)|0)+(d>>>26)|0)>>>26,a&=67108863}r.words[o]=f,n=a,a=i}return 0!==n?r.words[o]=n:r.length--,r.strip()}(this,t,e):p(this,t,e)},b.prototype.makeRBT=function(t){for(var e=new Array(t),r=o.prototype._countBits(t)-1,n=0;n<t;n++)e[n]=this.revBin(n,r,t);return e},b.prototype.revBin=function(t,e,r){if(0===t||t===r-1)return t;for(var n=0,i=0;i<e;i++)n|=(1&t)<<e-i-1,t>>=1;return n},b.prototype.permute=function(t,e,r,n,i,o){for(var a=0;a<o;a++)n[a]=e[t[a]],i[a]=r[t[a]]},b.prototype.transform=function(t,e,r,n,i,o){this.permute(o,t,e,r,n,i);for(var a=1;a<i;a<<=1)for(var f=a<<1,s=Math.cos(2*Math.PI/f),c=Math.sin(2*Math.PI/f),u=0;u<i;u+=f)for(var h=s,d=c,l=0;l<a;l++){var p=r[u+l],b=n[u+l],y=r[u+l+a],v=n[u+l+a],g=h*y-d*v;v=h*v+d*y,y=g,r[u+l]=p+y,n[u+l]=b+v,r[u+l+a]=p-y,n[u+l+a]=b-v,l!==f&&(g=s*h-c*d,d=s*d+c*h,h=g)}},b.prototype.guessLen13b=function(t,e){var r=1|Math.max(e,t),n=1&r,i=0;for(r=r/2|0;r;r>>>=1)i++;return 1<<i+1+n},b.prototype.conjugate=function(t,e,r){if(!(r<=1))for(var n=0;n<r/2;n++){var i=t[n];t[n]=t[r-n-1],t[r-n-1]=i,i=e[n],e[n]=-e[r-n-1],e[r-n-1]=-i}},b.prototype.normalize13b=function(t,e){for(var r=0,n=0;n<e/2;n++){var i=8192*Math.round(t[2*n+1]/e)+Math.round(t[2*n]/e)+r;t[n]=67108863&i,r=i<67108864?0:i/67108864|0}return t},b.prototype.convert13b=function(t,e,r,i){for(var o=0,a=0;a<e;a++)o+=0|t[a],r[2*a]=8191&o,o>>>=13,r[2*a+1]=8191&o,o>>>=13;for(a=2*e;a<i;++a)r[a]=0;n(0===o),n(0==(-8192&o))},b.prototype.stub=function(t){for(var e=new Array(t),r=0;r<t;r++)e[r]=0;return e},b.prototype.mulp=function(t,e,r){var n=2*this.guessLen13b(t.length,e.length),i=this.makeRBT(n),o=this.stub(n),a=new Array(n),f=new Array(n),s=new Array(n),c=new Array(n),u=new Array(n),h=new Array(n),d=r.words;d.length=n,this.convert13b(t.words,t.length,a,n),this.convert13b(e.words,e.length,c,n),this.transform(a,o,f,s,n,i),this.transform(c,o,u,h,n,i);for(var l=0;l<n;l++){var p=f[l]*u[l]-s[l]*h[l];s[l]=f[l]*h[l]+s[l]*u[l],f[l]=p}return this.conjugate(f,s,n),this.transform(f,s,d,o,n,i),this.conjugate(d,o,n),this.normalize13b(d,n),r.negative=t.negative^e.negative,r.length=t.length+e.length,r.strip()},o.prototype.mul=function(t){var e=new o(null);return e.words=new Array(this.length+t.length),this.mulTo(t,e)},o.prototype.mulf=function(t){var e=new o(null);return e.words=new Array(this.length+t.length),p(this,t,e)},o.prototype.imul=function(t){return this.clone().mulTo(t,this)},o.prototype.imuln=function(t){n("number"==typeof t),n(t<67108864);for(var e=0,r=0;r<this.length;r++){var i=(0|this.words[r])*t,o=(67108863&i)+(67108863&e);e>>=26,e+=i/67108864|0,e+=o>>>26,this.words[r]=67108863&o}return 0!==e&&(this.words[r]=e,this.length++),this},o.prototype.muln=function(t){return this.clone().imuln(t)},o.prototype.sqr=function(){return this.mul(this)},o.prototype.isqr=function(){return this.imul(this.clone())},o.prototype.pow=function(t){var e=function(t){for(var e=new Array(t.bitLength()),r=0;r<e.length;r++){var n=r/26|0,i=r%26;e[r]=(t.words[n]&1<<i)>>>i}return e}(t);if(0===e.length)return new o(1);for(var r=this,n=0;n<e.length&&0===e[n];n++,r=r.sqr());if(++n<e.length)for(var i=r.sqr();n<e.length;n++,i=i.sqr())0!==e[n]&&(r=r.mul(i));return r},o.prototype.iushln=function(t){n("number"==typeof t&&t>=0);var e,r=t%26,i=(t-r)/26,o=67108863>>>26-r<<26-r;if(0!==r){var a=0;for(e=0;e<this.length;e++){var f=this.words[e]&o,s=(0|this.words[e])-f<<r;this.words[e]=s|a,a=f>>>26-r}a&&(this.words[e]=a,this.length++)}if(0!==i){for(e=this.length-1;e>=0;e--)this.words[e+i]=this.words[e];for(e=0;e<i;e++)this.words[e]=0;this.length+=i}return this.strip()},o.prototype.ishln=function(t){return n(0===this.negative),this.iushln(t)},o.prototype.iushrn=function(t,e,r){var i;n("number"==typeof t&&t>=0),i=e?(e-e%26)/26:0;var o=t%26,a=Math.min((t-o)/26,this.length),f=67108863^67108863>>>o<<o,s=r;if(i-=a,i=Math.max(0,i),s){for(var c=0;c<a;c++)s.words[c]=this.words[c];s.length=a}if(0===a);else if(this.length>a)for(this.length-=a,c=0;c<this.length;c++)this.words[c]=this.words[c+a];else this.words[0]=0,this.length=1;var u=0;for(c=this.length-1;c>=0&&(0!==u||c>=i);c--){var h=0|this.words[c];this.words[c]=u<<26-o|h>>>o,u=h&f}return s&&0!==u&&(s.words[s.length++]=u),0===this.length&&(this.words[0]=0,this.length=1),this.strip()},o.prototype.ishrn=function(t,e,r){return n(0===this.negative),this.iushrn(t,e,r)},o.prototype.shln=function(t){return this.clone().ishln(t)},o.prototype.ushln=function(t){return this.clone().iushln(t)},o.prototype.shrn=function(t){return this.clone().ishrn(t)},o.prototype.ushrn=function(t){return this.clone().iushrn(t)},o.prototype.testn=function(t){n("number"==typeof t&&t>=0);var e=t%26,r=(t-e)/26,i=1<<e;return!(this.length<=r||!(this.words[r]&i))},o.prototype.imaskn=function(t){n("number"==typeof t&&t>=0);var e=t%26,r=(t-e)/26;if(n(0===this.negative,"imaskn works only with positive numbers"),this.length<=r)return this;if(0!==e&&r++,this.length=Math.min(r,this.length),0!==e){var i=67108863^67108863>>>e<<e;this.words[this.length-1]&=i}return this.strip()},o.prototype.maskn=function(t){return this.clone().imaskn(t)},o.prototype.iaddn=function(t){return n("number"==typeof t),n(t<67108864),t<0?this.isubn(-t):0!==this.negative?1===this.length&&(0|this.words[0])<t?(this.words[0]=t-(0|this.words[0]),this.negative=0,this):(this.negative=0,this.isubn(t),this.negative=1,this):this._iaddn(t)},o.prototype._iaddn=function(t){this.words[0]+=t;for(var e=0;e<this.length&&this.words[e]>=67108864;e++)this.words[e]-=67108864,e===this.length-1?this.words[e+1]=1:this.words[e+1]++;return this.length=Math.max(this.length,e+1),this},o.prototype.isubn=function(t){if(n("number"==typeof t),n(t<67108864),t<0)return this.iaddn(-t);if(0!==this.negative)return this.negative=0,this.iaddn(t),this.negative=1,this;if(this.words[0]-=t,1===this.length&&this.words[0]<0)this.words[0]=-this.words[0],this.negative=1;else for(var e=0;e<this.length&&this.words[e]<0;e++)this.words[e]+=67108864,this.words[e+1]-=1;return this.strip()},o.prototype.addn=function(t){return this.clone().iaddn(t)},o.prototype.subn=function(t){return this.clone().isubn(t)},o.prototype.iabs=function(){return this.negative=0,this},o.prototype.abs=function(){return this.clone().iabs()},o.prototype._ishlnsubmul=function(t,e,r){var i,o,a=t.length+r;this._expand(a);var f=0;for(i=0;i<t.length;i++){o=(0|this.words[i+r])+f;var s=(0|t.words[i])*e;f=((o-=67108863&s)>>26)-(s/67108864|0),this.words[i+r]=67108863&o}for(;i<this.length-r;i++)f=(o=(0|this.words[i+r])+f)>>26,this.words[i+r]=67108863&o;if(0===f)return this.strip();for(n(-1===f),f=0,i=0;i<this.length;i++)f=(o=-(0|this.words[i])+f)>>26,this.words[i]=67108863&o;return this.negative=1,this.strip()},o.prototype._wordDiv=function(t,e){var r=(this.length,t.length),n=this.clone(),i=t,a=0|i.words[i.length-1];0!=(r=26-this._countBits(a))&&(i=i.ushln(r),n.iushln(r),a=0|i.words[i.length-1]);var f,s=n.length-i.length;if("mod"!==e){(f=new o(null)).length=s+1,f.words=new Array(f.length);for(var c=0;c<f.length;c++)f.words[c]=0}var u=n.clone()._ishlnsubmul(i,1,s);0===u.negative&&(n=u,f&&(f.words[s]=1));for(var h=s-1;h>=0;h--){var d=67108864*(0|n.words[i.length+h])+(0|n.words[i.length+h-1]);for(d=Math.min(d/a|0,67108863),n._ishlnsubmul(i,d,h);0!==n.negative;)d--,n.negative=0,n._ishlnsubmul(i,1,h),n.isZero()||(n.negative^=1);f&&(f.words[h]=d)}return f&&f.strip(),n.strip(),"div"!==e&&0!==r&&n.iushrn(r),{div:f||null,mod:n}},o.prototype.divmod=function(t,e,r){return n(!t.isZero()),this.isZero()?{div:new o(0),mod:new o(0)}:0!==this.negative&&0===t.negative?(f=this.neg().divmod(t,e),"mod"!==e&&(i=f.div.neg()),"div"!==e&&(a=f.mod.neg(),r&&0!==a.negative&&a.iadd(t)),{div:i,mod:a}):0===this.negative&&0!==t.negative?(f=this.divmod(t.neg(),e),"mod"!==e&&(i=f.div.neg()),{div:i,mod:f.mod}):0!=(this.negative&t.negative)?(f=this.neg().divmod(t.neg(),e),"div"!==e&&(a=f.mod.neg(),r&&0!==a.negative&&a.isub(t)),{div:f.div,mod:a}):t.length>this.length||this.cmp(t)<0?{div:new o(0),mod:this}:1===t.length?"div"===e?{div:this.divn(t.words[0]),mod:null}:"mod"===e?{div:null,mod:new o(this.modn(t.words[0]))}:{div:this.divn(t.words[0]),mod:new o(this.modn(t.words[0]))}:this._wordDiv(t,e);var i,a,f},o.prototype.div=function(t){return this.divmod(t,"div",!1).div},o.prototype.mod=function(t){return this.divmod(t,"mod",!1).mod},o.prototype.umod=function(t){return this.divmod(t,"mod",!0).mod},o.prototype.divRound=function(t){var e=this.divmod(t);if(e.mod.isZero())return e.div;var r=0!==e.div.negative?e.mod.isub(t):e.mod,n=t.ushrn(1),i=t.andln(1),o=r.cmp(n);return o<0||1===i&&0===o?e.div:0!==e.div.negative?e.div.isubn(1):e.div.iaddn(1)},o.prototype.modn=function(t){n(t<=67108863);for(var e=(1<<26)%t,r=0,i=this.length-1;i>=0;i--)r=(e*r+(0|this.words[i]))%t;return r},o.prototype.idivn=function(t){n(t<=67108863);for(var e=0,r=this.length-1;r>=0;r--){var i=(0|this.words[r])+67108864*e;this.words[r]=i/t|0,e=i%t}return this.strip()},o.prototype.divn=function(t){return this.clone().idivn(t)},o.prototype.egcd=function(t){n(0===t.negative),n(!t.isZero());var e=this,r=t.clone();e=0!==e.negative?e.umod(t):e.clone();for(var i=new o(1),a=new o(0),f=new o(0),s=new o(1),c=0;e.isEven()&&r.isEven();)e.iushrn(1),r.iushrn(1),++c;for(var u=r.clone(),h=e.clone();!e.isZero();){for(var d=0,l=1;0==(e.words[0]&l)&&d<26;++d,l<<=1);if(d>0)for(e.iushrn(d);d-- >0;)(i.isOdd()||a.isOdd())&&(i.iadd(u),a.isub(h)),i.iushrn(1),a.iushrn(1);for(var p=0,b=1;0==(r.words[0]&b)&&p<26;++p,b<<=1);if(p>0)for(r.iushrn(p);p-- >0;)(f.isOdd()||s.isOdd())&&(f.iadd(u),s.isub(h)),f.iushrn(1),s.iushrn(1);e.cmp(r)>=0?(e.isub(r),i.isub(f),a.isub(s)):(r.isub(e),f.isub(i),s.isub(a))}return{a:f,b:s,gcd:r.iushln(c)}},o.prototype._invmp=function(t){n(0===t.negative),n(!t.isZero());var e=this,r=t.clone();e=0!==e.negative?e.umod(t):e.clone();for(var i,a=new o(1),f=new o(0),s=r.clone();e.cmpn(1)>0&&r.cmpn(1)>0;){for(var c=0,u=1;0==(e.words[0]&u)&&c<26;++c,u<<=1);if(c>0)for(e.iushrn(c);c-- >0;)a.isOdd()&&a.iadd(s),a.iushrn(1);for(var h=0,d=1;0==(r.words[0]&d)&&h<26;++h,d<<=1);if(h>0)for(r.iushrn(h);h-- >0;)f.isOdd()&&f.iadd(s),f.iushrn(1);e.cmp(r)>=0?(e.isub(r),a.isub(f)):(r.isub(e),f.isub(a))}return(i=0===e.cmpn(1)?a:f).cmpn(0)<0&&i.iadd(t),i},o.prototype.gcd=function(t){if(this.isZero())return t.abs();if(t.isZero())return this.abs();var e=this.clone(),r=t.clone();e.negative=0,r.negative=0;for(var n=0;e.isEven()&&r.isEven();n++)e.iushrn(1),r.iushrn(1);for(;;){for(;e.isEven();)e.iushrn(1);for(;r.isEven();)r.iushrn(1);var i=e.cmp(r);if(i<0){var o=e;e=r,r=o}else if(0===i||0===r.cmpn(1))break;e.isub(r)}return r.iushln(n)},o.prototype.invm=function(t){return this.egcd(t).a.umod(t)},o.prototype.isEven=function(){return 0==(1&this.words[0])},o.prototype.isOdd=function(){return 1==(1&this.words[0])},o.prototype.andln=function(t){return this.words[0]&t},o.prototype.bincn=function(t){n("number"==typeof t);var e=t%26,r=(t-e)/26,i=1<<e;if(this.length<=r)return this._expand(r+1),this.words[r]|=i,this;for(var o=i,a=r;0!==o&&a<this.length;a++){var f=0|this.words[a];o=(f+=o)>>>26,f&=67108863,this.words[a]=f}return 0!==o&&(this.words[a]=o,this.length++),this},o.prototype.isZero=function(){return 1===this.length&&0===this.words[0]},o.prototype.cmpn=function(t){var e,r=t<0;if(0!==this.negative&&!r)return-1;if(0===this.negative&&r)return 1;if(this.strip(),this.length>1)e=1;else{r&&(t=-t),n(t<=67108863,"Number is too big");var i=0|this.words[0];e=i===t?0:i<t?-1:1}return 0!==this.negative?0|-e:e},o.prototype.cmp=function(t){if(0!==this.negative&&0===t.negative)return-1;if(0===this.negative&&0!==t.negative)return 1;var e=this.ucmp(t);return 0!==this.negative?0|-e:e},o.prototype.ucmp=function(t){if(this.length>t.length)return 1;if(this.length<t.length)return-1;for(var e=0,r=this.length-1;r>=0;r--){var n=0|this.words[r],i=0|t.words[r];if(n!==i){n<i?e=-1:n>i&&(e=1);break}}return e},o.prototype.gtn=function(t){return 1===this.cmpn(t)},o.prototype.gt=function(t){return 1===this.cmp(t)},o.prototype.gten=function(t){return this.cmpn(t)>=0},o.prototype.gte=function(t){return this.cmp(t)>=0},o.prototype.ltn=function(t){return-1===this.cmpn(t)},o.prototype.lt=function(t){return-1===this.cmp(t)},o.prototype.lten=function(t){return this.cmpn(t)<=0},o.prototype.lte=function(t){return this.cmp(t)<=0},o.prototype.eqn=function(t){return 0===this.cmpn(t)},o.prototype.eq=function(t){return 0===this.cmp(t)},o.red=function(t){return new S(t)},o.prototype.toRed=function(t){return n(!this.red,"Already a number in reduction context"),n(0===this.negative,"red works only with positives"),t.convertTo(this)._forceRed(t)},o.prototype.fromRed=function(){return n(this.red,"fromRed works only with numbers in reduction context"),this.red.convertFrom(this)},o.prototype._forceRed=function(t){return this.red=t,this},o.prototype.forceRed=function(t){return n(!this.red,"Already a number in reduction context"),this._forceRed(t)},o.prototype.redAdd=function(t){return n(this.red,"redAdd works only with red numbers"),this.red.add(this,t)},o.prototype.redIAdd=function(t){return n(this.red,"redIAdd works only with red numbers"),this.red.iadd(this,t)},o.prototype.redSub=function(t){return n(this.red,"redSub works only with red numbers"),this.red.sub(this,t)},o.prototype.redISub=function(t){return n(this.red,"redISub works only with red numbers"),this.red.isub(this,t)},o.prototype.redShl=function(t){return n(this.red,"redShl works only with red numbers"),this.red.shl(this,t)},o.prototype.redMul=function(t){return n(this.red,"redMul works only with red numbers"),this.red._verify2(this,t),this.red.mul(this,t)},o.prototype.redIMul=function(t){return n(this.red,"redMul works only with red numbers"),this.red._verify2(this,t),this.red.imul(this,t)},o.prototype.redSqr=function(){return n(this.red,"redSqr works only with red numbers"),this.red._verify1(this),this.red.sqr(this)},o.prototype.redISqr=function(){return n(this.red,"redISqr works only with red numbers"),this.red._verify1(this),this.red.isqr(this)},o.prototype.redSqrt=function(){return n(this.red,"redSqrt works only with red numbers"),this.red._verify1(this),this.red.sqrt(this)},o.prototype.redInvm=function(){return n(this.red,"redInvm works only with red numbers"),this.red._verify1(this),this.red.invm(this)},o.prototype.redNeg=function(){return n(this.red,"redNeg works only with red numbers"),this.red._verify1(this),this.red.neg(this)},o.prototype.redPow=function(t){return n(this.red&&!t.red,"redPow(normalNum)"),this.red._verify1(this),this.red.pow(this,t)};var y={k256:null,p224:null,p192:null,p25519:null};function v(t,e){this.name=t,this.p=new o(e,16),this.n=this.p.bitLength(),this.k=new o(1).iushln(this.n).isub(this.p),this.tmp=this._tmp()}function g(){v.call(this,"k256","ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2f")}function m(){v.call(this,"p224","ffffffff ffffffff ffffffff ffffffff 00000000 00000000 00000001")}function _(){v.call(this,"p192","ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff")}function w(){v.call(this,"25519","7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed")}function S(t){if("string"==typeof t){var e=o._prime(t);this.m=e.p,this.prime=e}else n(t.gtn(1),"modulus must be greater than 1"),this.m=t,this.prime=null}function E(t){S.call(this,t),this.shift=this.m.bitLength(),this.shift%26!=0&&(this.shift+=26-this.shift%26),this.r=new o(1).iushln(this.shift),this.r2=this.imod(this.r.sqr()),this.rinv=this.r._invmp(this.m),this.minv=this.rinv.mul(this.r).isubn(1).div(this.m),this.minv=this.minv.umod(this.r),this.minv=this.r.sub(this.minv)}v.prototype._tmp=function(){var t=new o(null);return t.words=new Array(Math.ceil(this.n/13)),t},v.prototype.ireduce=function(t){var e,r=t;do{this.split(r,this.tmp),e=(r=(r=this.imulK(r)).iadd(this.tmp)).bitLength()}while(e>this.n);var n=e<this.n?-1:r.ucmp(this.p);return 0===n?(r.words[0]=0,r.length=1):n>0?r.isub(this.p):r.strip(),r},v.prototype.split=function(t,e){t.iushrn(this.n,0,e)},v.prototype.imulK=function(t){return t.imul(this.k)},i(g,v),g.prototype.split=function(t,e){for(var r=Math.min(t.length,9),n=0;n<r;n++)e.words[n]=t.words[n];if(e.length=r,t.length<=9)return t.words[0]=0,void(t.length=1);var i=t.words[9];for(e.words[e.length++]=4194303&i,n=10;n<t.length;n++){var o=0|t.words[n];t.words[n-10]=(4194303&o)<<4|i>>>22,i=o}i>>>=22,t.words[n-10]=i,0===i&&t.length>10?t.length-=10:t.length-=9},g.prototype.imulK=function(t){t.words[t.length]=0,t.words[t.length+1]=0,t.length+=2;for(var e=0,r=0;r<t.length;r++){var n=0|t.words[r];e+=977*n,t.words[r]=67108863&e,e=64*n+(e/67108864|0)}return 0===t.words[t.length-1]&&(t.length--,0===t.words[t.length-1]&&t.length--),t},i(m,v),i(_,v),i(w,v),w.prototype.imulK=function(t){for(var e=0,r=0;r<t.length;r++){var n=19*(0|t.words[r])+e,i=67108863&n;n>>>=26,t.words[r]=i,e=n}return 0!==e&&(t.words[t.length++]=e),t},o._prime=function(t){if(y[t])return y[t];var e;if("k256"===t)e=new g;else if("p224"===t)e=new m;else if("p192"===t)e=new _;else{if("p25519"!==t)throw new Error("Unknown prime "+t);e=new w}return y[t]=e,e},S.prototype._verify1=function(t){n(0===t.negative,"red works only with positives"),n(t.red,"red works only with red numbers")},S.prototype._verify2=function(t,e){n(0==(t.negative|e.negative),"red works only with positives"),n(t.red&&t.red===e.red,"red works only with red numbers")},S.prototype.imod=function(t){return this.prime?this.prime.ireduce(t)._forceRed(this):t.umod(this.m)._forceRed(this)},S.prototype.neg=function(t){return t.isZero()?t.clone():this.m.sub(t)._forceRed(this)},S.prototype.add=function(t,e){this._verify2(t,e);var r=t.add(e);return r.cmp(this.m)>=0&&r.isub(this.m),r._forceRed(this)},S.prototype.iadd=function(t,e){this._verify2(t,e);var r=t.iadd(e);return r.cmp(this.m)>=0&&r.isub(this.m),r},S.prototype.sub=function(t,e){this._verify2(t,e);var r=t.sub(e);return r.cmpn(0)<0&&r.iadd(this.m),r._forceRed(this)},S.prototype.isub=function(t,e){this._verify2(t,e);var r=t.isub(e);return r.cmpn(0)<0&&r.iadd(this.m),r},S.prototype.shl=function(t,e){return this._verify1(t),this.imod(t.ushln(e))},S.prototype.imul=function(t,e){return this._verify2(t,e),this.imod(t.imul(e))},S.prototype.mul=function(t,e){return this._verify2(t,e),this.imod(t.mul(e))},S.prototype.isqr=function(t){return this.imul(t,t.clone())},S.prototype.sqr=function(t){return this.mul(t,t)},S.prototype.sqrt=function(t){if(t.isZero())return t.clone();var e=this.m.andln(3);if(n(e%2==1),3===e){var r=this.m.add(new o(1)).iushrn(2);return this.pow(t,r)}for(var i=this.m.subn(1),a=0;!i.isZero()&&0===i.andln(1);)a++,i.iushrn(1);n(!i.isZero());var f=new o(1).toRed(this),s=f.redNeg(),c=this.m.subn(1).iushrn(1),u=this.m.bitLength();for(u=new o(2*u*u).toRed(this);0!==this.pow(u,c).cmp(s);)u.redIAdd(s);for(var h=this.pow(u,i),d=this.pow(t,i.addn(1).iushrn(1)),l=this.pow(t,i),p=a;0!==l.cmp(f);){for(var b=l,y=0;0!==b.cmp(f);y++)b=b.redSqr();n(y<p);var v=this.pow(h,new o(1).iushln(p-y-1));d=d.redMul(v),h=v.redSqr(),l=l.redMul(h),p=y}return d},S.prototype.invm=function(t){var e=t._invmp(this.m);return 0!==e.negative?(e.negative=0,this.imod(e).redNeg()):this.imod(e)},S.prototype.pow=function(t,e){if(e.isZero())return new o(1).toRed(this);if(0===e.cmpn(1))return t.clone();var r=new Array(16);r[0]=new o(1).toRed(this),r[1]=t;for(var n=2;n<r.length;n++)r[n]=this.mul(r[n-1],t);var i=r[0],a=0,f=0,s=e.bitLength()%26;for(0===s&&(s=26),n=e.length-1;n>=0;n--){for(var c=e.words[n],u=s-1;u>=0;u--){var h=c>>u&1;i!==r[0]&&(i=this.sqr(i)),0!==h||0!==a?(a<<=1,a|=h,(4==++f||0===n&&0===u)&&(i=this.mul(i,r[a]),f=0,a=0)):f=0}s=26}return i},S.prototype.convertTo=function(t){var e=t.umod(this.m);return e===t?e.clone():e},S.prototype.convertFrom=function(t){var e=t.clone();return e.red=null,e},o.mont=function(t){return new E(t)},i(E,S),E.prototype.convertTo=function(t){return this.imod(t.ushln(this.shift))},E.prototype.convertFrom=function(t){var e=this.imod(t.mul(this.rinv));return e.red=null,e},E.prototype.imul=function(t,e){if(t.isZero()||e.isZero())return t.words[0]=0,t.length=1,t;var r=t.imul(e),n=r.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m),i=r.isub(n).iushrn(this.shift),o=i;return i.cmp(this.m)>=0?o=i.isub(this.m):i.cmpn(0)<0&&(o=i.iadd(this.m)),o._forceRed(this)},E.prototype.mul=function(t,e){if(t.isZero()||e.isZero())return new o(0)._forceRed(this);var r=t.mul(e),n=r.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m),i=r.isub(n).iushrn(this.shift),a=i;return i.cmp(this.m)>=0?a=i.isub(this.m):i.cmpn(0)<0&&(a=i.iadd(this.m)),a._forceRed(this)},E.prototype.invm=function(t){return this.imod(t._invmp(this.m).mul(this.r2))._forceRed(this)}}(void 0===t||t,this)}).call(this,r(114)(t))},function(t,e,r){"use strict";(function(t){
/*!
           * The buffer module from node.js, for the browser.
           *
           * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
           * @license  MIT
           */
var n=r(76),i=r(77),o=r(37);function a(){return s.TYPED_ARRAY_SUPPORT?2147483647:1073741823}function f(t,e){if(a()<e)throw new RangeError("Invalid typed array length");return s.TYPED_ARRAY_SUPPORT?(t=new Uint8Array(e)).__proto__=s.prototype:(null===t&&(t=new s(e)),t.length=e),t}function s(t,e,r){if(!(s.TYPED_ARRAY_SUPPORT||this instanceof s))return new s(t,e,r);if("number"==typeof t){if("string"==typeof e)throw new Error("If encoding is specified then the first argument must be a string");return h(this,t)}return c(this,t,e,r)}function c(t,e,r,n){if("number"==typeof e)throw new TypeError('"value" argument must not be a number');return"undefined"!=typeof ArrayBuffer&&e instanceof ArrayBuffer?function(t,e,r,n){if(e.byteLength,r<0||e.byteLength<r)throw new RangeError("'offset' is out of bounds");if(e.byteLength<r+(n||0))throw new RangeError("'length' is out of bounds");return e=void 0===r&&void 0===n?new Uint8Array(e):void 0===n?new Uint8Array(e,r):new Uint8Array(e,r,n),s.TYPED_ARRAY_SUPPORT?(t=e).__proto__=s.prototype:t=d(t,e),t}(t,e,r,n):"string"==typeof e?function(t,e,r){if("string"==typeof r&&""!==r||(r="utf8"),!s.isEncoding(r))throw new TypeError('"encoding" must be a valid string encoding');var n=0|p(e,r),i=(t=f(t,n)).write(e,r);return i!==n&&(t=t.slice(0,i)),t}(t,e,r):function(t,e){if(s.isBuffer(e)){var r=0|l(e.length);return 0===(t=f(t,r)).length?t:(e.copy(t,0,0,r),t)}if(e){if("undefined"!=typeof ArrayBuffer&&e.buffer instanceof ArrayBuffer||"length"in e)return"number"!=typeof e.length||function(t){return t!=t}(e.length)?f(t,0):d(t,e);if("Buffer"===e.type&&o(e.data))return d(t,e.data)}throw new TypeError("First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.")}(t,e)}function u(t){if("number"!=typeof t)throw new TypeError('"size" argument must be a number');if(t<0)throw new RangeError('"size" argument must not be negative')}function h(t,e){if(u(e),t=f(t,e<0?0:0|l(e)),!s.TYPED_ARRAY_SUPPORT)for(var r=0;r<e;++r)t[r]=0;return t}function d(t,e){var r=e.length<0?0:0|l(e.length);t=f(t,r);for(var n=0;n<r;n+=1)t[n]=255&e[n];return t}function l(t){if(t>=a())throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x"+a().toString(16)+" bytes");return 0|t}function p(t,e){if(s.isBuffer(t))return t.length;if("undefined"!=typeof ArrayBuffer&&"function"==typeof ArrayBuffer.isView&&(ArrayBuffer.isView(t)||t instanceof ArrayBuffer))return t.byteLength;"string"!=typeof t&&(t=""+t);var r=t.length;if(0===r)return 0;for(var n=!1;;)switch(e){case"ascii":case"latin1":case"binary":return r;case"utf8":case"utf-8":case void 0:return q(t).length;case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return 2*r;case"hex":return r>>>1;case"base64":return z(t).length;default:if(n)return q(t).length;e=(""+e).toLowerCase(),n=!0}}function b(t,e,r){var n=t[e];t[e]=t[r],t[r]=n}function y(t,e,r,n,i){if(0===t.length)return-1;if("string"==typeof r?(n=r,r=0):r>2147483647?r=2147483647:r<-2147483648&&(r=-2147483648),r=+r,isNaN(r)&&(r=i?0:t.length-1),r<0&&(r=t.length+r),r>=t.length){if(i)return-1;r=t.length-1}else if(r<0){if(!i)return-1;r=0}if("string"==typeof e&&(e=s.from(e,n)),s.isBuffer(e))return 0===e.length?-1:v(t,e,r,n,i);if("number"==typeof e)return e&=255,s.TYPED_ARRAY_SUPPORT&&"function"==typeof Uint8Array.prototype.indexOf?i?Uint8Array.prototype.indexOf.call(t,e,r):Uint8Array.prototype.lastIndexOf.call(t,e,r):v(t,[e],r,n,i);throw new TypeError("val must be string, number or Buffer")}function v(t,e,r,n,i){var o,a=1,f=t.length,s=e.length;if(void 0!==n&&("ucs2"===(n=String(n).toLowerCase())||"ucs-2"===n||"utf16le"===n||"utf-16le"===n)){if(t.length<2||e.length<2)return-1;a=2,f/=2,s/=2,r/=2}function c(t,e){return 1===a?t[e]:t.readUInt16BE(e*a)}if(i){var u=-1;for(o=r;o<f;o++)if(c(t,o)===c(e,-1===u?0:o-u)){if(-1===u&&(u=o),o-u+1===s)return u*a}else-1!==u&&(o-=o-u),u=-1}else for(r+s>f&&(r=f-s),o=r;o>=0;o--){for(var h=!0,d=0;d<s;d++)if(c(t,o+d)!==c(e,d)){h=!1;break}if(h)return o}return-1}function g(t,e,r,n){r=Number(r)||0;var i=t.length-r;n?(n=Number(n))>i&&(n=i):n=i;var o=e.length;if(o%2!=0)throw new TypeError("Invalid hex string");n>o/2&&(n=o/2);for(var a=0;a<n;++a){var f=parseInt(e.substr(2*a,2),16);if(isNaN(f))return a;t[r+a]=f}return a}function m(t,e,r,n){return F(q(e,t.length-r),t,r,n)}function _(t,e,r,n){return F(function(t){for(var e=[],r=0;r<t.length;++r)e.push(255&t.charCodeAt(r));return e}(e),t,r,n)}function w(t,e,r,n){return _(t,e,r,n)}function S(t,e,r,n){return F(z(e),t,r,n)}function E(t,e,r,n){return F(function(t,e){for(var r,n,i,o=[],a=0;a<t.length&&!((e-=2)<0);++a)n=(r=t.charCodeAt(a))>>8,i=r%256,o.push(i),o.push(n);return o}(e,t.length-r),t,r,n)}function M(t,e,r){return 0===e&&r===t.length?n.fromByteArray(t):n.fromByteArray(t.slice(e,r))}function A(t,e,r){r=Math.min(t.length,r);for(var n=[],i=e;i<r;){var o,a,f,s,c=t[i],u=null,h=c>239?4:c>223?3:c>191?2:1;if(i+h<=r)switch(h){case 1:c<128&&(u=c);break;case 2:128==(192&(o=t[i+1]))&&(s=(31&c)<<6|63&o)>127&&(u=s);break;case 3:o=t[i+1],a=t[i+2],128==(192&o)&&128==(192&a)&&(s=(15&c)<<12|(63&o)<<6|63&a)>2047&&(s<55296||s>57343)&&(u=s);break;case 4:o=t[i+1],a=t[i+2],f=t[i+3],128==(192&o)&&128==(192&a)&&128==(192&f)&&(s=(15&c)<<18|(63&o)<<12|(63&a)<<6|63&f)>65535&&s<1114112&&(u=s)}null===u?(u=65533,h=1):u>65535&&(u-=65536,n.push(u>>>10&1023|55296),u=56320|1023&u),n.push(u),i+=h}return function(t){var e=t.length;if(e<=x)return String.fromCharCode.apply(String,t);for(var r="",n=0;n<e;)r+=String.fromCharCode.apply(String,t.slice(n,n+=x));return r}(n)}e.Buffer=s,e.SlowBuffer=function(t){return+t!=t&&(t=0),s.alloc(+t)},e.INSPECT_MAX_BYTES=50,s.TYPED_ARRAY_SUPPORT=void 0!==t.TYPED_ARRAY_SUPPORT?t.TYPED_ARRAY_SUPPORT:function(){try{var t=new Uint8Array(1);return t.__proto__={__proto__:Uint8Array.prototype,foo:function(){return 42}},42===t.foo()&&"function"==typeof t.subarray&&0===t.subarray(1,1).byteLength}catch(t){return!1}}(),e.kMaxLength=a(),s.poolSize=8192,s._augment=function(t){return t.__proto__=s.prototype,t},s.from=function(t,e,r){return c(null,t,e,r)},s.TYPED_ARRAY_SUPPORT&&(s.prototype.__proto__=Uint8Array.prototype,s.__proto__=Uint8Array,"undefined"!=typeof Symbol&&Symbol.species&&s[Symbol.species]===s&&Object.defineProperty(s,Symbol.species,{value:null,configurable:!0})),s.alloc=function(t,e,r){return function(t,e,r,n){return u(e),e<=0?f(t,e):void 0!==r?"string"==typeof n?f(t,e).fill(r,n):f(t,e).fill(r):f(t,e)}(null,t,e,r)},s.allocUnsafe=function(t){return h(null,t)},s.allocUnsafeSlow=function(t){return h(null,t)},s.isBuffer=function(t){return!(null==t||!t._isBuffer)},s.compare=function(t,e){if(!s.isBuffer(t)||!s.isBuffer(e))throw new TypeError("Arguments must be Buffers");if(t===e)return 0;for(var r=t.length,n=e.length,i=0,o=Math.min(r,n);i<o;++i)if(t[i]!==e[i]){r=t[i],n=e[i];break}return r<n?-1:n<r?1:0},s.isEncoding=function(t){switch(String(t).toLowerCase()){case"hex":case"utf8":case"utf-8":case"ascii":case"latin1":case"binary":case"base64":case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return!0;default:return!1}},s.concat=function(t,e){if(!o(t))throw new TypeError('"list" argument must be an Array of Buffers');if(0===t.length)return s.alloc(0);var r;if(void 0===e)for(e=0,r=0;r<t.length;++r)e+=t[r].length;var n=s.allocUnsafe(e),i=0;for(r=0;r<t.length;++r){var a=t[r];if(!s.isBuffer(a))throw new TypeError('"list" argument must be an Array of Buffers');a.copy(n,i),i+=a.length}return n},s.byteLength=p,s.prototype._isBuffer=!0,s.prototype.swap16=function(){var t=this.length;if(t%2!=0)throw new RangeError("Buffer size must be a multiple of 16-bits");for(var e=0;e<t;e+=2)b(this,e,e+1);return this},s.prototype.swap32=function(){var t=this.length;if(t%4!=0)throw new RangeError("Buffer size must be a multiple of 32-bits");for(var e=0;e<t;e+=4)b(this,e,e+3),b(this,e+1,e+2);return this},s.prototype.swap64=function(){var t=this.length;if(t%8!=0)throw new RangeError("Buffer size must be a multiple of 64-bits");for(var e=0;e<t;e+=8)b(this,e,e+7),b(this,e+1,e+6),b(this,e+2,e+5),b(this,e+3,e+4);return this},s.prototype.toString=function(){var t=0|this.length;return 0===t?"":0===arguments.length?A(this,0,t):function(t,e,r){var n=!1;if((void 0===e||e<0)&&(e=0),e>this.length)return"";if((void 0===r||r>this.length)&&(r=this.length),r<=0)return"";if((r>>>=0)<=(e>>>=0))return"";for(t||(t="utf8");;)switch(t){case"hex":return B(this,e,r);case"utf8":case"utf-8":return A(this,e,r);case"ascii":return k(this,e,r);case"latin1":case"binary":return I(this,e,r);case"base64":return M(this,e,r);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return R(this,e,r);default:if(n)throw new TypeError("Unknown encoding: "+t);t=(t+"").toLowerCase(),n=!0}}.apply(this,arguments)},s.prototype.equals=function(t){if(!s.isBuffer(t))throw new TypeError("Argument must be a Buffer");return this===t||0===s.compare(this,t)},s.prototype.inspect=function(){var t="",r=e.INSPECT_MAX_BYTES;return this.length>0&&(t=this.toString("hex",0,r).match(/.{2}/g).join(" "),this.length>r&&(t+=" ... ")),"<Buffer "+t+">"},s.prototype.compare=function(t,e,r,n,i){if(!s.isBuffer(t))throw new TypeError("Argument must be a Buffer");if(void 0===e&&(e=0),void 0===r&&(r=t?t.length:0),void 0===n&&(n=0),void 0===i&&(i=this.length),e<0||r>t.length||n<0||i>this.length)throw new RangeError("out of range index");if(n>=i&&e>=r)return 0;if(n>=i)return-1;if(e>=r)return 1;if(e>>>=0,r>>>=0,n>>>=0,i>>>=0,this===t)return 0;for(var o=i-n,a=r-e,f=Math.min(o,a),c=this.slice(n,i),u=t.slice(e,r),h=0;h<f;++h)if(c[h]!==u[h]){o=c[h],a=u[h];break}return o<a?-1:a<o?1:0},s.prototype.includes=function(t,e,r){return-1!==this.indexOf(t,e,r)},s.prototype.indexOf=function(t,e,r){return y(this,t,e,r,!0)},s.prototype.lastIndexOf=function(t,e,r){return y(this,t,e,r,!1)},s.prototype.write=function(t,e,r,n){if(void 0===e)n="utf8",r=this.length,e=0;else if(void 0===r&&"string"==typeof e)n=e,r=this.length,e=0;else{if(!isFinite(e))throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");e|=0,isFinite(r)?(r|=0,void 0===n&&(n="utf8")):(n=r,r=void 0)}var i=this.length-e;if((void 0===r||r>i)&&(r=i),t.length>0&&(r<0||e<0)||e>this.length)throw new RangeError("Attempt to write outside buffer bounds");n||(n="utf8");for(var o=!1;;)switch(n){case"hex":return g(this,t,e,r);case"utf8":case"utf-8":return m(this,t,e,r);case"ascii":return _(this,t,e,r);case"latin1":case"binary":return w(this,t,e,r);case"base64":return S(this,t,e,r);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return E(this,t,e,r);default:if(o)throw new TypeError("Unknown encoding: "+n);n=(""+n).toLowerCase(),o=!0}},s.prototype.toJSON=function(){return{type:"Buffer",data:Array.prototype.slice.call(this._arr||this,0)}};var x=4096;function k(t,e,r){var n="";r=Math.min(t.length,r);for(var i=e;i<r;++i)n+=String.fromCharCode(127&t[i]);return n}function I(t,e,r){var n="";r=Math.min(t.length,r);for(var i=e;i<r;++i)n+=String.fromCharCode(t[i]);return n}function B(t,e,r){var n=t.length;(!e||e<0)&&(e=0),(!r||r<0||r>n)&&(r=n);for(var i="",o=e;o<r;++o)i+=U(t[o]);return i}function R(t,e,r){for(var n=t.slice(e,r),i="",o=0;o<n.length;o+=2)i+=String.fromCharCode(n[o]+256*n[o+1]);return i}function P(t,e,r){if(t%1!=0||t<0)throw new RangeError("offset is not uint");if(t+e>r)throw new RangeError("Trying to access beyond buffer length")}function T(t,e,r,n,i,o){if(!s.isBuffer(t))throw new TypeError('"buffer" argument must be a Buffer instance');if(e>i||e<o)throw new RangeError('"value" argument is out of bounds');if(r+n>t.length)throw new RangeError("Index out of range")}function L(t,e,r,n){e<0&&(e=65535+e+1);for(var i=0,o=Math.min(t.length-r,2);i<o;++i)t[r+i]=(e&255<<8*(n?i:1-i))>>>8*(n?i:1-i)}function O(t,e,r,n){e<0&&(e=4294967295+e+1);for(var i=0,o=Math.min(t.length-r,4);i<o;++i)t[r+i]=e>>>8*(n?i:3-i)&255}function C(t,e,r,n,i,o){if(r+n>t.length)throw new RangeError("Index out of range");if(r<0)throw new RangeError("Index out of range")}function j(t,e,r,n,o){return o||C(t,0,r,4),i.write(t,e,r,n,23,4),r+4}function N(t,e,r,n,o){return o||C(t,0,r,8),i.write(t,e,r,n,52,8),r+8}s.prototype.slice=function(t,e){var r,n=this.length;if(t=~~t,e=void 0===e?n:~~e,t<0?(t+=n)<0&&(t=0):t>n&&(t=n),e<0?(e+=n)<0&&(e=0):e>n&&(e=n),e<t&&(e=t),s.TYPED_ARRAY_SUPPORT)(r=this.subarray(t,e)).__proto__=s.prototype;else{var i=e-t;r=new s(i,void 0);for(var o=0;o<i;++o)r[o]=this[o+t]}return r},s.prototype.readUIntLE=function(t,e,r){t|=0,e|=0,r||P(t,e,this.length);for(var n=this[t],i=1,o=0;++o<e&&(i*=256);)n+=this[t+o]*i;return n},s.prototype.readUIntBE=function(t,e,r){t|=0,e|=0,r||P(t,e,this.length);for(var n=this[t+--e],i=1;e>0&&(i*=256);)n+=this[t+--e]*i;return n},s.prototype.readUInt8=function(t,e){return e||P(t,1,this.length),this[t]},s.prototype.readUInt16LE=function(t,e){return e||P(t,2,this.length),this[t]|this[t+1]<<8},s.prototype.readUInt16BE=function(t,e){return e||P(t,2,this.length),this[t]<<8|this[t+1]},s.prototype.readUInt32LE=function(t,e){return e||P(t,4,this.length),(this[t]|this[t+1]<<8|this[t+2]<<16)+16777216*this[t+3]},s.prototype.readUInt32BE=function(t,e){return e||P(t,4,this.length),16777216*this[t]+(this[t+1]<<16|this[t+2]<<8|this[t+3])},s.prototype.readIntLE=function(t,e,r){t|=0,e|=0,r||P(t,e,this.length);for(var n=this[t],i=1,o=0;++o<e&&(i*=256);)n+=this[t+o]*i;return n>=(i*=128)&&(n-=Math.pow(2,8*e)),n},s.prototype.readIntBE=function(t,e,r){t|=0,e|=0,r||P(t,e,this.length);for(var n=e,i=1,o=this[t+--n];n>0&&(i*=256);)o+=this[t+--n]*i;return o>=(i*=128)&&(o-=Math.pow(2,8*e)),o},s.prototype.readInt8=function(t,e){return e||P(t,1,this.length),128&this[t]?-1*(255-this[t]+1):this[t]},s.prototype.readInt16LE=function(t,e){e||P(t,2,this.length);var r=this[t]|this[t+1]<<8;return 32768&r?4294901760|r:r},s.prototype.readInt16BE=function(t,e){e||P(t,2,this.length);var r=this[t+1]|this[t]<<8;return 32768&r?4294901760|r:r},s.prototype.readInt32LE=function(t,e){return e||P(t,4,this.length),this[t]|this[t+1]<<8|this[t+2]<<16|this[t+3]<<24},s.prototype.readInt32BE=function(t,e){return e||P(t,4,this.length),this[t]<<24|this[t+1]<<16|this[t+2]<<8|this[t+3]},s.prototype.readFloatLE=function(t,e){return e||P(t,4,this.length),i.read(this,t,!0,23,4)},s.prototype.readFloatBE=function(t,e){return e||P(t,4,this.length),i.read(this,t,!1,23,4)},s.prototype.readDoubleLE=function(t,e){return e||P(t,8,this.length),i.read(this,t,!0,52,8)},s.prototype.readDoubleBE=function(t,e){return e||P(t,8,this.length),i.read(this,t,!1,52,8)},s.prototype.writeUIntLE=function(t,e,r,n){t=+t,e|=0,r|=0,n||T(this,t,e,r,Math.pow(2,8*r)-1,0);var i=1,o=0;for(this[e]=255&t;++o<r&&(i*=256);)this[e+o]=t/i&255;return e+r},s.prototype.writeUIntBE=function(t,e,r,n){t=+t,e|=0,r|=0,n||T(this,t,e,r,Math.pow(2,8*r)-1,0);var i=r-1,o=1;for(this[e+i]=255&t;--i>=0&&(o*=256);)this[e+i]=t/o&255;return e+r},s.prototype.writeUInt8=function(t,e,r){return t=+t,e|=0,r||T(this,t,e,1,255,0),s.TYPED_ARRAY_SUPPORT||(t=Math.floor(t)),this[e]=255&t,e+1},s.prototype.writeUInt16LE=function(t,e,r){return t=+t,e|=0,r||T(this,t,e,2,65535,0),s.TYPED_ARRAY_SUPPORT?(this[e]=255&t,this[e+1]=t>>>8):L(this,t,e,!0),e+2},s.prototype.writeUInt16BE=function(t,e,r){return t=+t,e|=0,r||T(this,t,e,2,65535,0),s.TYPED_ARRAY_SUPPORT?(this[e]=t>>>8,this[e+1]=255&t):L(this,t,e,!1),e+2},s.prototype.writeUInt32LE=function(t,e,r){return t=+t,e|=0,r||T(this,t,e,4,4294967295,0),s.TYPED_ARRAY_SUPPORT?(this[e+3]=t>>>24,this[e+2]=t>>>16,this[e+1]=t>>>8,this[e]=255&t):O(this,t,e,!0),e+4},s.prototype.writeUInt32BE=function(t,e,r){return t=+t,e|=0,r||T(this,t,e,4,4294967295,0),s.TYPED_ARRAY_SUPPORT?(this[e]=t>>>24,this[e+1]=t>>>16,this[e+2]=t>>>8,this[e+3]=255&t):O(this,t,e,!1),e+4},s.prototype.writeIntLE=function(t,e,r,n){if(t=+t,e|=0,!n){var i=Math.pow(2,8*r-1);T(this,t,e,r,i-1,-i)}var o=0,a=1,f=0;for(this[e]=255&t;++o<r&&(a*=256);)t<0&&0===f&&0!==this[e+o-1]&&(f=1),this[e+o]=(t/a>>0)-f&255;return e+r},s.prototype.writeIntBE=function(t,e,r,n){if(t=+t,e|=0,!n){var i=Math.pow(2,8*r-1);T(this,t,e,r,i-1,-i)}var o=r-1,a=1,f=0;for(this[e+o]=255&t;--o>=0&&(a*=256);)t<0&&0===f&&0!==this[e+o+1]&&(f=1),this[e+o]=(t/a>>0)-f&255;return e+r},s.prototype.writeInt8=function(t,e,r){return t=+t,e|=0,r||T(this,t,e,1,127,-128),s.TYPED_ARRAY_SUPPORT||(t=Math.floor(t)),t<0&&(t=255+t+1),this[e]=255&t,e+1},s.prototype.writeInt16LE=function(t,e,r){return t=+t,e|=0,r||T(this,t,e,2,32767,-32768),s.TYPED_ARRAY_SUPPORT?(this[e]=255&t,this[e+1]=t>>>8):L(this,t,e,!0),e+2},s.prototype.writeInt16BE=function(t,e,r){return t=+t,e|=0,r||T(this,t,e,2,32767,-32768),s.TYPED_ARRAY_SUPPORT?(this[e]=t>>>8,this[e+1]=255&t):L(this,t,e,!1),e+2},s.prototype.writeInt32LE=function(t,e,r){return t=+t,e|=0,r||T(this,t,e,4,2147483647,-2147483648),s.TYPED_ARRAY_SUPPORT?(this[e]=255&t,this[e+1]=t>>>8,this[e+2]=t>>>16,this[e+3]=t>>>24):O(this,t,e,!0),e+4},s.prototype.writeInt32BE=function(t,e,r){return t=+t,e|=0,r||T(this,t,e,4,2147483647,-2147483648),t<0&&(t=4294967295+t+1),s.TYPED_ARRAY_SUPPORT?(this[e]=t>>>24,this[e+1]=t>>>16,this[e+2]=t>>>8,this[e+3]=255&t):O(this,t,e,!1),e+4},s.prototype.writeFloatLE=function(t,e,r){return j(this,t,e,!0,r)},s.prototype.writeFloatBE=function(t,e,r){return j(this,t,e,!1,r)},s.prototype.writeDoubleLE=function(t,e,r){return N(this,t,e,!0,r)},s.prototype.writeDoubleBE=function(t,e,r){return N(this,t,e,!1,r)},s.prototype.copy=function(t,e,r,n){if(r||(r=0),n||0===n||(n=this.length),e>=t.length&&(e=t.length),e||(e=0),n>0&&n<r&&(n=r),n===r)return 0;if(0===t.length||0===this.length)return 0;if(e<0)throw new RangeError("targetStart out of bounds");if(r<0||r>=this.length)throw new RangeError("sourceStart out of bounds");if(n<0)throw new RangeError("sourceEnd out of bounds");n>this.length&&(n=this.length),t.length-e<n-r&&(n=t.length-e+r);var i,o=n-r;if(this===t&&r<e&&e<n)for(i=o-1;i>=0;--i)t[i+e]=this[i+r];else if(o<1e3||!s.TYPED_ARRAY_SUPPORT)for(i=0;i<o;++i)t[i+e]=this[i+r];else Uint8Array.prototype.set.call(t,this.subarray(r,r+o),e);return o},s.prototype.fill=function(t,e,r,n){if("string"==typeof t){if("string"==typeof e?(n=e,e=0,r=this.length):"string"==typeof r&&(n=r,r=this.length),1===t.length){var i=t.charCodeAt(0);i<256&&(t=i)}if(void 0!==n&&"string"!=typeof n)throw new TypeError("encoding must be a string");if("string"==typeof n&&!s.isEncoding(n))throw new TypeError("Unknown encoding: "+n)}else"number"==typeof t&&(t&=255);if(e<0||this.length<e||this.length<r)throw new RangeError("Out of range index");if(r<=e)return this;var o;if(e>>>=0,r=void 0===r?this.length:r>>>0,t||(t=0),"number"==typeof t)for(o=e;o<r;++o)this[o]=t;else{var a=s.isBuffer(t)?t:q(new s(t,n).toString()),f=a.length;for(o=0;o<r-e;++o)this[o+e]=a[o%f]}return this};var D=/[^+\/0-9A-Za-z-_]/g;function U(t){return t<16?"0"+t.toString(16):t.toString(16)}function q(t,e){var r;e=e||1/0;for(var n=t.length,i=null,o=[],a=0;a<n;++a){if((r=t.charCodeAt(a))>55295&&r<57344){if(!i){if(r>56319){(e-=3)>-1&&o.push(239,191,189);continue}if(a+1===n){(e-=3)>-1&&o.push(239,191,189);continue}i=r;continue}if(r<56320){(e-=3)>-1&&o.push(239,191,189),i=r;continue}r=65536+(i-55296<<10|r-56320)}else i&&(e-=3)>-1&&o.push(239,191,189);if(i=null,r<128){if((e-=1)<0)break;o.push(r)}else if(r<2048){if((e-=2)<0)break;o.push(r>>6|192,63&r|128)}else if(r<65536){if((e-=3)<0)break;o.push(r>>12|224,r>>6&63|128,63&r|128)}else{if(!(r<1114112))throw new Error("Invalid code point");if((e-=4)<0)break;o.push(r>>18|240,r>>12&63|128,r>>6&63|128,63&r|128)}}return o}function z(t){return n.toByteArray(function(t){if((t=function(t){return t.trim?t.trim():t.replace(/^\s+|\s+$/g,"")}(t).replace(D,"")).length<2)return"";for(;t.length%4!=0;)t+="=";return t}(t))}function F(t,e,r,n){for(var i=0;i<n&&!(i+r>=e.length||i>=t.length);++i)e[i+r]=t[i];return i}}).call(this,r(7))},function(t,e,r){"use strict";var n=e;n.version=r(121).version,n.utils=r(122),n.rand=r(59),n.curve=r(22),n.curves=r(127),n.ec=r(135),n.eddsa=r(139)},function(t,e){function r(t,e){if(!t)throw new Error(e||"Assertion failed")}t.exports=r,r.equal=function(t,e,r){if(t!=e)throw new Error(r||"Assertion failed: "+t+" != "+e)}},function(t,e,r){"use strict";var n=r(5),i=r(0);function o(t){return(t>>>24|t>>>8&65280|t<<8&16711680|(255&t)<<24)>>>0}function a(t){return 1===t.length?"0"+t:t}function f(t){return 7===t.length?"0"+t:6===t.length?"00"+t:5===t.length?"000"+t:4===t.length?"0000"+t:3===t.length?"00000"+t:2===t.length?"000000"+t:1===t.length?"0000000"+t:t}e.inherits=i,e.toArray=function(t,e){if(Array.isArray(t))return t.slice();if(!t)return[];var r=[];if("string"==typeof t)if(e){if("hex"===e)for((t=t.replace(/[^a-z0-9]+/gi,"")).length%2!=0&&(t="0"+t),n=0;n<t.length;n+=2)r.push(parseInt(t[n]+t[n+1],16))}else for(var n=0;n<t.length;n++){var i=t.charCodeAt(n),o=i>>8,a=255&i;o?r.push(o,a):r.push(a)}else for(n=0;n<t.length;n++)r[n]=0|t[n];return r},e.toHex=function(t){for(var e="",r=0;r<t.length;r++)e+=a(t[r].toString(16));return e},e.htonl=o,e.toHex32=function(t,e){for(var r="",n=0;n<t.length;n++){var i=t[n];"little"===e&&(i=o(i)),r+=f(i.toString(16))}return r},e.zero2=a,e.zero8=f,e.join32=function(t,e,r,i){var o=r-e;n(o%4==0);for(var a=new Array(o/4),f=0,s=e;f<a.length;f++,s+=4){var c;c="big"===i?t[s]<<24|t[s+1]<<16|t[s+2]<<8|t[s+3]:t[s+3]<<24|t[s+2]<<16|t[s+1]<<8|t[s],a[f]=c>>>0}return a},e.split32=function(t,e){for(var r=new Array(4*t.length),n=0,i=0;n<t.length;n++,i+=4){var o=t[n];"big"===e?(r[i]=o>>>24,r[i+1]=o>>>16&255,r[i+2]=o>>>8&255,r[i+3]=255&o):(r[i+3]=o>>>24,r[i+2]=o>>>16&255,r[i+1]=o>>>8&255,r[i]=255&o)}return r},e.rotr32=function(t,e){return t>>>e|t<<32-e},e.rotl32=function(t,e){return t<<e|t>>>32-e},e.sum32=function(t,e){return t+e>>>0},e.sum32_3=function(t,e,r){return t+e+r>>>0},e.sum32_4=function(t,e,r,n){return t+e+r+n>>>0},e.sum32_5=function(t,e,r,n,i){return t+e+r+n+i>>>0},e.sum64=function(t,e,r,n){var i=t[e],o=n+t[e+1]>>>0,a=(o<n?1:0)+r+i;t[e]=a>>>0,t[e+1]=o},e.sum64_hi=function(t,e,r,n){return(e+n>>>0<e?1:0)+t+r>>>0},e.sum64_lo=function(t,e,r,n){return e+n>>>0},e.sum64_4_hi=function(t,e,r,n,i,o,a,f){var s=0,c=e;return s+=(c=c+n>>>0)<e?1:0,s+=(c=c+o>>>0)<o?1:0,t+r+i+a+(s+=(c=c+f>>>0)<f?1:0)>>>0},e.sum64_4_lo=function(t,e,r,n,i,o,a,f){return e+n+o+f>>>0},e.sum64_5_hi=function(t,e,r,n,i,o,a,f,s,c){var u=0,h=e;return u+=(h=h+n>>>0)<e?1:0,u+=(h=h+o>>>0)<o?1:0,u+=(h=h+f>>>0)<f?1:0,t+r+i+a+s+(u+=(h=h+c>>>0)<c?1:0)>>>0},e.sum64_5_lo=function(t,e,r,n,i,o,a,f,s,c){return e+n+o+f+c>>>0},e.rotr64_hi=function(t,e,r){return(e<<32-r|t>>>r)>>>0},e.rotr64_lo=function(t,e,r){return(t<<32-r|e>>>r)>>>0},e.shr64_hi=function(t,e,r){return t>>>r},e.shr64_lo=function(t,e,r){return(t<<32-r|e>>>r)>>>0}},function(t,e){var r;r=function(){return this}();try{r=r||Function("return this")()||(0,eval)("this")}catch(t){"object"==typeof window&&(r=window)}t.exports=r},function(t,e){var r,n,i=t.exports={};function o(){throw new Error("setTimeout has not been defined")}function a(){throw new Error("clearTimeout has not been defined")}function f(t){if(r===setTimeout)return setTimeout(t,0);if((r===o||!r)&&setTimeout)return r=setTimeout,setTimeout(t,0);try{return r(t,0)}catch(e){try{return r.call(null,t,0)}catch(e){return r.call(this,t,0)}}}!function(){try{r="function"==typeof setTimeout?setTimeout:o}catch(t){r=o}try{n="function"==typeof clearTimeout?clearTimeout:a}catch(t){n=a}}();var s,c=[],u=!1,h=-1;function d(){u&&s&&(u=!1,s.length?c=s.concat(c):h=-1,c.length&&l())}function l(){if(!u){var t=f(d);u=!0;for(var e=c.length;e;){for(s=c,c=[];++h<e;)s&&s[h].run();h=-1,e=c.length}s=null,u=!1,function(t){if(n===clearTimeout)return clearTimeout(t);if((n===a||!n)&&clearTimeout)return n=clearTimeout,clearTimeout(t);try{n(t)}catch(e){try{return n.call(null,t)}catch(e){return n.call(this,t)}}}(t)}}function p(t,e){this.fun=t,this.array=e}function b(){}i.nextTick=function(t){var e=new Array(arguments.length-1);if(arguments.length>1)for(var r=1;r<arguments.length;r++)e[r-1]=arguments[r];c.push(new p(t,e)),1!==c.length||u||f(l)},p.prototype.run=function(){this.fun.apply(null,this.array)},i.title="browser",i.browser=!0,i.env={},i.argv=[],i.version="",i.versions={},i.on=b,i.addListener=b,i.once=b,i.off=b,i.removeListener=b,i.removeAllListeners=b,i.emit=b,i.prependListener=b,i.prependOnceListener=b,i.listeners=function(t){return[]},i.binding=function(t){throw new Error("process.binding is not supported")},i.cwd=function(){return"/"},i.chdir=function(t){throw new Error("process.chdir is not supported")},i.umask=function(){return 0}},function(t,e,r){var n=r(1).Buffer,i=r(25).Transform,o=r(29).StringDecoder;function a(t){i.call(this),this.hashMode="string"==typeof t,this.hashMode?this[t]=this._finalOrDigest:this.final=this._finalOrDigest,this._final&&(this.__final=this._final,this._final=null),this._decoder=null,this._encoding=null}r(0)(a,i),a.prototype.update=function(t,e,r){"string"==typeof t&&(t=n.from(t,e));var i=this._update(t);return this.hashMode?this:(r&&(i=this._toString(i,r)),i)},a.prototype.setAutoPadding=function(){},a.prototype.getAuthTag=function(){throw new Error("trying to get auth tag in unsupported state")},a.prototype.setAuthTag=function(){throw new Error("trying to set auth tag in unsupported state")},a.prototype.setAAD=function(){throw new Error("trying to set aad in unsupported state")},a.prototype._transform=function(t,e,r){var n;try{this.hashMode?this._update(t):this.push(this._update(t))}catch(t){n=t}finally{r(n)}},a.prototype._flush=function(t){var e;try{this.push(this.__final())}catch(t){e=t}t(e)},a.prototype._finalOrDigest=function(t){var e=this.__final()||n.alloc(0);return t&&(e=this._toString(e,t,!0)),e},a.prototype._toString=function(t,e,r){if(this._decoder||(this._decoder=new o(e),this._encoding=e),this._encoding!==e)throw new Error("can't switch encodings");var n=this._decoder.write(t);return r&&(n+=this._decoder.end()),n},t.exports=a},function(t,e,r){"use strict";var n=r(19),i=Object.keys||function(t){var e=[];for(var r in t)e.push(r);return e};t.exports=h;var o=r(14);o.inherits=r(0);var a=r(39),f=r(28);o.inherits(h,a);for(var s=i(f.prototype),c=0;c<s.length;c++){var u=s[c];h.prototype[u]||(h.prototype[u]=f.prototype[u])}function h(t){if(!(this instanceof h))return new h(t);a.call(this,t),f.call(this,t),t&&!1===t.readable&&(this.readable=!1),t&&!1===t.writable&&(this.writable=!1),this.allowHalfOpen=!0,t&&!1===t.allowHalfOpen&&(this.allowHalfOpen=!1),this.once("end",d)}function d(){this.allowHalfOpen||this._writableState.ended||n.nextTick(l,this)}function l(t){t.end()}Object.defineProperty(h.prototype,"writableHighWaterMark",{enumerable:!1,get:function(){return this._writableState.highWaterMark}}),Object.defineProperty(h.prototype,"destroyed",{get:function(){return void 0!==this._readableState&&void 0!==this._writableState&&this._readableState.destroyed&&this._writableState.destroyed},set:function(t){void 0!==this._readableState&&void 0!==this._writableState&&(this._readableState.destroyed=t,this._writableState.destroyed=t)}}),h.prototype._destroy=function(t,e){this.push(null),this.end(),n.nextTick(e,t)}},function(t,e,r){"use strict";(function(e,n){var i=r(1).Buffer,o=e.crypto||e.msCrypto;o&&o.getRandomValues?t.exports=function(t,r){if(t>65536)throw new Error("requested too many random bytes");var a=new e.Uint8Array(t);t>0&&o.getRandomValues(a);var f=i.from(a.buffer);return"function"==typeof r?n.nextTick(function(){r(null,f)}):f}:t.exports=function(){throw new Error("Secure random number generation is not supported by this browser.\nUse Chrome, Firefox or Internet Explorer 11")}}).call(this,r(7),r(8))},function(t,e,r){var n=r(1).Buffer;function i(t,e){this._block=n.alloc(t),this._finalSize=e,this._blockSize=t,this._len=0}i.prototype.update=function(t,e){"string"==typeof t&&(e=e||"utf8",t=n.from(t,e));for(var r=this._block,i=this._blockSize,o=t.length,a=this._len,f=0;f<o;){for(var s=a%i,c=Math.min(o-f,i-s),u=0;u<c;u++)r[s+u]=t[f+u];f+=c,(a+=c)%i==0&&this._update(r)}return this._len+=o,this},i.prototype.digest=function(t){var e=this._len%this._blockSize;this._block[e]=128,this._block.fill(0,e+1),e>=this._finalSize&&(this._update(this._block),this._block.fill(0));var r=8*this._len;if(r<=4294967295)this._block.writeUInt32BE(r,this._blockSize-4);else{var n=(4294967295&r)>>>0,i=(r-n)/4294967296;this._block.writeUInt32BE(i,this._blockSize-8),this._block.writeUInt32BE(n,this._blockSize-4)}this._update(this._block);var o=this._hash();return t?o.toString(t):o},i.prototype._update=function(){throw new Error("_update must be implemented by subclass")},t.exports=i},function(t,e,r){"use strict";var n=r(0),i=r(24),o=r(30),a=r(31),f=r(9);function s(t){f.call(this,"digest"),this._hash=t}n(s,f),s.prototype._update=function(t){this._hash.update(t)},s.prototype._final=function(){return this._hash.digest()},t.exports=function(t){return"md5"===(t=t.toLowerCase())?new i:"rmd160"===t||"ripemd160"===t?new o:new s(a(t))}},function(t,e,r){(function(t){function r(t){return Object.prototype.toString.call(t)}e.isArray=function(t){return Array.isArray?Array.isArray(t):"[object Array]"===r(t)},e.isBoolean=function(t){return"boolean"==typeof t},e.isNull=function(t){return null===t},e.isNullOrUndefined=function(t){return null==t},e.isNumber=function(t){return"number"==typeof t},e.isString=function(t){return"string"==typeof t},e.isSymbol=function(t){return"symbol"==typeof t},e.isUndefined=function(t){return void 0===t},e.isRegExp=function(t){return"[object RegExp]"===r(t)},e.isObject=function(t){return"object"==typeof t&&null!==t},e.isDate=function(t){return"[object Date]"===r(t)},e.isError=function(t){return"[object Error]"===r(t)||t instanceof Error},e.isFunction=function(t){return"function"==typeof t},e.isPrimitive=function(t){return null===t||"boolean"==typeof t||"number"==typeof t||"string"==typeof t||"symbol"==typeof t||void 0===t},e.isBuffer=t.isBuffer}).call(this,r(3).Buffer)},function(t,e,r){(function(e){t.exports=function(t,r){for(var n=Math.min(t.length,r.length),i=new e(n),o=0;o<n;++o)i[o]=t[o]^r[o];return i}}).call(this,r(3).Buffer)},function(t,e,r){"use strict";var n=r(6),i=r(5);function o(){this.pending=null,this.pendingTotal=0,this.blockSize=this.constructor.blockSize,this.outSize=this.constructor.outSize,this.hmacStrength=this.constructor.hmacStrength,this.padLength=this.constructor.padLength/8,this.endian="big",this._delta8=this.blockSize/8,this._delta32=this.blockSize/32}e.BlockHash=o,o.prototype.update=function(t,e){if(t=n.toArray(t,e),this.pending?this.pending=this.pending.concat(t):this.pending=t,this.pendingTotal+=t.length,this.pending.length>=this._delta8){var r=(t=this.pending).length%this._delta8;this.pending=t.slice(t.length-r,t.length),0===this.pending.length&&(this.pending=null),t=n.join32(t,0,t.length-r,this.endian);for(var i=0;i<t.length;i+=this._delta32)this._update(t,i,i+this._delta32)}return this},o.prototype.digest=function(t){return this.update(this._pad()),i(null===this.pending),this._digest(t)},o.prototype._pad=function(){var t=this.pendingTotal,e=this._delta8,r=e-(t+this.padLength)%e,n=new Array(r+this.padLength);n[0]=128;for(var i=1;i<r;i++)n[i]=0;if(t<<=3,"big"===this.endian){for(var o=8;o<this.padLength;o++)n[i++]=0;n[i++]=0,n[i++]=0,n[i++]=0,n[i++]=0,n[i++]=t>>>24&255,n[i++]=t>>>16&255,n[i++]=t>>>8&255,n[i++]=255&t}else for(n[i++]=255&t,n[i++]=t>>>8&255,n[i++]=t>>>16&255,n[i++]=t>>>24&255,n[i++]=0,n[i++]=0,n[i++]=0,n[i++]=0,o=8;o<this.padLength;o++)n[i++]=0;return n}},function(t,e,r){var n=e;n.bignum=r(2),n.define=r(143).define,n.base=r(18),n.constants=r(65),n.decoders=r(149),n.encoders=r(151)},function(t,e,r){var n=e;n.Reporter=r(146).Reporter,n.DecoderBuffer=r(64).DecoderBuffer,n.EncoderBuffer=r(64).EncoderBuffer,n.Node=r(147)},function(t,e,r){"use strict";(function(e){!e.version||0===e.version.indexOf("v0.")||0===e.version.indexOf("v1.")&&0!==e.version.indexOf("v1.8.")?t.exports={nextTick:function(t,r,n,i){if("function"!=typeof t)throw new TypeError('"callback" argument must be a function');var o,a,f=arguments.length;switch(f){case 0:case 1:return e.nextTick(t);case 2:return e.nextTick(function(){t.call(null,r)});case 3:return e.nextTick(function(){t.call(null,r,n)});case 4:return e.nextTick(function(){t.call(null,r,n,i)});default:for(o=new Array(f-1),a=0;a<o.length;)o[a++]=arguments[a];return e.nextTick(function(){t.apply(null,o)})}}}:t.exports=e}).call(this,r(8))},function(t,e,r){var n=r(1).Buffer;function i(t){n.isBuffer(t)||(t=n.from(t));for(var e=t.length/4|0,r=new Array(e),i=0;i<e;i++)r[i]=t.readUInt32BE(4*i);return r}function o(t){for(;0<t.length;t++)t[0]=0}function a(t,e,r,n,i){for(var o,a,f,s,c=r[0],u=r[1],h=r[2],d=r[3],l=t[0]^e[0],p=t[1]^e[1],b=t[2]^e[2],y=t[3]^e[3],v=4,g=1;g<i;g++)o=c[l>>>24]^u[p>>>16&255]^h[b>>>8&255]^d[255&y]^e[v++],a=c[p>>>24]^u[b>>>16&255]^h[y>>>8&255]^d[255&l]^e[v++],f=c[b>>>24]^u[y>>>16&255]^h[l>>>8&255]^d[255&p]^e[v++],s=c[y>>>24]^u[l>>>16&255]^h[p>>>8&255]^d[255&b]^e[v++],l=o,p=a,b=f,y=s;return o=(n[l>>>24]<<24|n[p>>>16&255]<<16|n[b>>>8&255]<<8|n[255&y])^e[v++],a=(n[p>>>24]<<24|n[b>>>16&255]<<16|n[y>>>8&255]<<8|n[255&l])^e[v++],f=(n[b>>>24]<<24|n[y>>>16&255]<<16|n[l>>>8&255]<<8|n[255&p])^e[v++],s=(n[y>>>24]<<24|n[l>>>16&255]<<16|n[p>>>8&255]<<8|n[255&b])^e[v++],[o>>>=0,a>>>=0,f>>>=0,s>>>=0]}var f=[0,1,2,4,8,16,32,64,128,27,54],s=function(){for(var t=new Array(256),e=0;e<256;e++)t[e]=e<128?e<<1:e<<1^283;for(var r=[],n=[],i=[[],[],[],[]],o=[[],[],[],[]],a=0,f=0,s=0;s<256;++s){var c=f^f<<1^f<<2^f<<3^f<<4;c=c>>>8^255&c^99,r[a]=c,n[c]=a;var u=t[a],h=t[u],d=t[h],l=257*t[c]^16843008*c;i[0][a]=l<<24|l>>>8,i[1][a]=l<<16|l>>>16,i[2][a]=l<<8|l>>>24,i[3][a]=l,l=16843009*d^65537*h^257*u^16843008*a,o[0][c]=l<<24|l>>>8,o[1][c]=l<<16|l>>>16,o[2][c]=l<<8|l>>>24,o[3][c]=l,0===a?a=f=1:(a=u^t[t[t[d^u]]],f^=t[t[f]])}return{SBOX:r,INV_SBOX:n,SUB_MIX:i,INV_SUB_MIX:o}}();function c(t){this._key=i(t),this._reset()}c.blockSize=16,c.keySize=32,c.prototype.blockSize=c.blockSize,c.prototype.keySize=c.keySize,c.prototype._reset=function(){for(var t=this._key,e=t.length,r=e+6,n=4*(r+1),i=[],o=0;o<e;o++)i[o]=t[o];for(o=e;o<n;o++){var a=i[o-1];o%e==0?(a=a<<8|a>>>24,a=s.SBOX[a>>>24]<<24|s.SBOX[a>>>16&255]<<16|s.SBOX[a>>>8&255]<<8|s.SBOX[255&a],a^=f[o/e|0]<<24):e>6&&o%e==4&&(a=s.SBOX[a>>>24]<<24|s.SBOX[a>>>16&255]<<16|s.SBOX[a>>>8&255]<<8|s.SBOX[255&a]),i[o]=i[o-e]^a}for(var c=[],u=0;u<n;u++){var h=n-u,d=i[h-(u%4?0:4)];c[u]=u<4||h<=4?d:s.INV_SUB_MIX[0][s.SBOX[d>>>24]]^s.INV_SUB_MIX[1][s.SBOX[d>>>16&255]]^s.INV_SUB_MIX[2][s.SBOX[d>>>8&255]]^s.INV_SUB_MIX[3][s.SBOX[255&d]]}this._nRounds=r,this._keySchedule=i,this._invKeySchedule=c},c.prototype.encryptBlockRaw=function(t){return a(t=i(t),this._keySchedule,s.SUB_MIX,s.SBOX,this._nRounds)},c.prototype.encryptBlock=function(t){var e=this.encryptBlockRaw(t),r=n.allocUnsafe(16);return r.writeUInt32BE(e[0],0),r.writeUInt32BE(e[1],4),r.writeUInt32BE(e[2],8),r.writeUInt32BE(e[3],12),r},c.prototype.decryptBlock=function(t){var e=(t=i(t))[1];t[1]=t[3],t[3]=e;var r=a(t,this._invKeySchedule,s.INV_SUB_MIX,s.INV_SBOX,this._nRounds),o=n.allocUnsafe(16);return o.writeUInt32BE(r[0],0),o.writeUInt32BE(r[3],4),o.writeUInt32BE(r[2],8),o.writeUInt32BE(r[1],12),o},c.prototype.scrub=function(){o(this._keySchedule),o(this._invKeySchedule),o(this._key)},t.exports.AES=c},function(t,e,r){var n=r(1).Buffer,i=r(24);t.exports=function(t,e,r,o){if(n.isBuffer(t)||(t=n.from(t,"binary")),e&&(n.isBuffer(e)||(e=n.from(e,"binary")),8!==e.length))throw new RangeError("salt should be Buffer with 8 byte length");for(var a=r/8,f=n.alloc(a),s=n.alloc(o||0),c=n.alloc(0);a>0||o>0;){var u=new i;u.update(c),u.update(t),e&&u.update(e),c=u.digest();var h=0;if(a>0){var d=f.length-a;h=Math.min(a,c.length),c.copy(f,d,0,h),a-=h}if(h<c.length&&o>0){var l=s.length-o,p=Math.min(o,c.length-h);c.copy(s,l,h,h+p),o-=p}}return c.fill(0),{key:f,iv:s}}},function(t,e,r){"use strict";var n=e;n.base=r(123),n.short=r(124),n.mont=r(125),n.edwards=r(126)},function(t,e,r){(function(e){var n=r(142),i=r(154),o=r(155),a=r(33),f=r(48);function s(t){var r;"object"!=typeof t||e.isBuffer(t)||(r=t.passphrase,t=t.key),"string"==typeof t&&(t=new e(t));var s,c,u=o(t,r),h=u.tag,d=u.data;switch(h){case"CERTIFICATE":c=n.certificate.decode(d,"der").tbsCertificate.subjectPublicKeyInfo;case"PUBLIC KEY":switch(c||(c=n.PublicKey.decode(d,"der")),s=c.algorithm.algorithm.join(".")){case"1.2.840.113549.1.1.1":return n.RSAPublicKey.decode(c.subjectPublicKey.data,"der");case"1.2.840.10045.2.1":return c.subjectPrivateKey=c.subjectPublicKey,{type:"ec",data:c};case"1.2.840.10040.4.1":return c.algorithm.params.pub_key=n.DSAparam.decode(c.subjectPublicKey.data,"der"),{type:"dsa",data:c.algorithm.params};default:throw new Error("unknown key id "+s)}throw new Error("unknown key type "+h);case"ENCRYPTED PRIVATE KEY":d=function(t,r){var n=t.algorithm.decrypt.kde.kdeparams.salt,o=parseInt(t.algorithm.decrypt.kde.kdeparams.iters.toString(),10),s=i[t.algorithm.decrypt.cipher.algo.join(".")],c=t.algorithm.decrypt.cipher.iv,u=t.subjectPrivateKey,h=parseInt(s.split("-")[1],10)/8,d=f.pbkdf2Sync(r,n,o,h),l=a.createDecipheriv(s,d,c),p=[];return p.push(l.update(u)),p.push(l.final()),e.concat(p)}(d=n.EncryptedPrivateKey.decode(d,"der"),r);case"PRIVATE KEY":switch(s=(c=n.PrivateKey.decode(d,"der")).algorithm.algorithm.join(".")){case"1.2.840.113549.1.1.1":return n.RSAPrivateKey.decode(c.subjectPrivateKey,"der");case"1.2.840.10045.2.1":return{curve:c.algorithm.curve,privateKey:n.ECPrivateKey.decode(c.subjectPrivateKey,"der").privateKey};case"1.2.840.10040.4.1":return c.algorithm.params.priv_key=n.DSAparam.decode(c.subjectPrivateKey,"der"),{type:"dsa",params:c.algorithm.params};default:throw new Error("unknown key id "+s)}throw new Error("unknown key type "+h);case"RSA PUBLIC KEY":return n.RSAPublicKey.decode(d,"der");case"RSA PRIVATE KEY":return n.RSAPrivateKey.decode(d,"der");case"DSA PRIVATE KEY":return{type:"dsa",params:n.DSAPrivateKey.decode(d,"der")};case"EC PRIVATE KEY":return{curve:(d=n.ECPrivateKey.decode(d,"der")).parameters.value,privateKey:d.privateKey};default:throw new Error("unknown key type "+h)}}t.exports=s,s.signature=n.signature}).call(this,r(3).Buffer)},function(t,e,r){"use strict";var n=r(0),i=r(38),o=r(1).Buffer,a=new Array(16);function f(){i.call(this,64),this._a=1732584193,this._b=4023233417,this._c=2562383102,this._d=271733878}function s(t,e){return t<<e|t>>>32-e}function c(t,e,r,n,i,o,a){return s(t+(e&r|~e&n)+i+o|0,a)+e|0}function u(t,e,r,n,i,o,a){return s(t+(e&n|r&~n)+i+o|0,a)+e|0}function h(t,e,r,n,i,o,a){return s(t+(e^r^n)+i+o|0,a)+e|0}function d(t,e,r,n,i,o,a){return s(t+(r^(e|~n))+i+o|0,a)+e|0}n(f,i),f.prototype._update=function(){for(var t=a,e=0;e<16;++e)t[e]=this._block.readInt32LE(4*e);var r=this._a,n=this._b,i=this._c,o=this._d;n=d(n=d(n=d(n=d(n=h(n=h(n=h(n=h(n=u(n=u(n=u(n=u(n=c(n=c(n=c(n=c(n,i=c(i,o=c(o,r=c(r,n,i,o,t[0],3614090360,7),n,i,t[1],3905402710,12),r,n,t[2],606105819,17),o,r,t[3],3250441966,22),i=c(i,o=c(o,r=c(r,n,i,o,t[4],4118548399,7),n,i,t[5],1200080426,12),r,n,t[6],2821735955,17),o,r,t[7],4249261313,22),i=c(i,o=c(o,r=c(r,n,i,o,t[8],1770035416,7),n,i,t[9],2336552879,12),r,n,t[10],4294925233,17),o,r,t[11],2304563134,22),i=c(i,o=c(o,r=c(r,n,i,o,t[12],1804603682,7),n,i,t[13],4254626195,12),r,n,t[14],2792965006,17),o,r,t[15],1236535329,22),i=u(i,o=u(o,r=u(r,n,i,o,t[1],4129170786,5),n,i,t[6],3225465664,9),r,n,t[11],643717713,14),o,r,t[0],3921069994,20),i=u(i,o=u(o,r=u(r,n,i,o,t[5],3593408605,5),n,i,t[10],38016083,9),r,n,t[15],3634488961,14),o,r,t[4],3889429448,20),i=u(i,o=u(o,r=u(r,n,i,o,t[9],568446438,5),n,i,t[14],3275163606,9),r,n,t[3],4107603335,14),o,r,t[8],1163531501,20),i=u(i,o=u(o,r=u(r,n,i,o,t[13],2850285829,5),n,i,t[2],4243563512,9),r,n,t[7],1735328473,14),o,r,t[12],2368359562,20),i=h(i,o=h(o,r=h(r,n,i,o,t[5],4294588738,4),n,i,t[8],2272392833,11),r,n,t[11],1839030562,16),o,r,t[14],4259657740,23),i=h(i,o=h(o,r=h(r,n,i,o,t[1],2763975236,4),n,i,t[4],1272893353,11),r,n,t[7],4139469664,16),o,r,t[10],3200236656,23),i=h(i,o=h(o,r=h(r,n,i,o,t[13],681279174,4),n,i,t[0],3936430074,11),r,n,t[3],3572445317,16),o,r,t[6],76029189,23),i=h(i,o=h(o,r=h(r,n,i,o,t[9],3654602809,4),n,i,t[12],3873151461,11),r,n,t[15],530742520,16),o,r,t[2],3299628645,23),i=d(i,o=d(o,r=d(r,n,i,o,t[0],4096336452,6),n,i,t[7],1126891415,10),r,n,t[14],2878612391,15),o,r,t[5],4237533241,21),i=d(i,o=d(o,r=d(r,n,i,o,t[12],1700485571,6),n,i,t[3],2399980690,10),r,n,t[10],4293915773,15),o,r,t[1],2240044497,21),i=d(i,o=d(o,r=d(r,n,i,o,t[8],1873313359,6),n,i,t[15],4264355552,10),r,n,t[6],2734768916,15),o,r,t[13],1309151649,21),i=d(i,o=d(o,r=d(r,n,i,o,t[4],4149444226,6),n,i,t[11],3174756917,10),r,n,t[2],718787259,15),o,r,t[9],3951481745,21),this._a=this._a+r|0,this._b=this._b+n|0,this._c=this._c+i|0,this._d=this._d+o|0},f.prototype._digest=function(){this._block[this._blockOffset++]=128,this._blockOffset>56&&(this._block.fill(0,this._blockOffset,64),this._update(),this._blockOffset=0),this._block.fill(0,this._blockOffset,56),this._block.writeUInt32LE(this._length[0],56),this._block.writeUInt32LE(this._length[1],60),this._update();var t=o.allocUnsafe(16);return t.writeInt32LE(this._a,0),t.writeInt32LE(this._b,4),t.writeInt32LE(this._c,8),t.writeInt32LE(this._d,12),t},t.exports=f},function(t,e,r){t.exports=i;var n=r(26).EventEmitter;function i(){n.call(this)}r(0)(i,n),i.Readable=r(27),i.Writable=r(85),i.Duplex=r(86),i.Transform=r(87),i.PassThrough=r(88),i.Stream=i,i.prototype.pipe=function(t,e){var r=this;function i(e){t.writable&&!1===t.write(e)&&r.pause&&r.pause()}function o(){r.readable&&r.resume&&r.resume()}r.on("data",i),t.on("drain",o),t._isStdio||e&&!1===e.end||(r.on("end",f),r.on("close",s));var a=!1;function f(){a||(a=!0,t.end())}function s(){a||(a=!0,"function"==typeof t.destroy&&t.destroy())}function c(t){if(u(),0===n.listenerCount(this,"error"))throw t}function u(){r.removeListener("data",i),t.removeListener("drain",o),r.removeListener("end",f),r.removeListener("close",s),r.removeListener("error",c),t.removeListener("error",c),r.removeListener("end",u),r.removeListener("close",u),t.removeListener("close",u)}return r.on("error",c),t.on("error",c),r.on("end",u),r.on("close",u),t.on("close",u),t.emit("pipe",r),t}},function(t,e){function r(){this._events=this._events||{},this._maxListeners=this._maxListeners||void 0}function n(t){return"function"==typeof t}function i(t){return"object"==typeof t&&null!==t}function o(t){return void 0===t}t.exports=r,r.EventEmitter=r,r.prototype._events=void 0,r.prototype._maxListeners=void 0,r.defaultMaxListeners=10,r.prototype.setMaxListeners=function(t){if(!function(t){return"number"==typeof t}(t)||t<0||isNaN(t))throw TypeError("n must be a positive number");return this._maxListeners=t,this},r.prototype.emit=function(t){var e,r,a,f,s,c;if(this._events||(this._events={}),"error"===t&&(!this._events.error||i(this._events.error)&&!this._events.error.length)){if((e=arguments[1])instanceof Error)throw e;var u=new Error('Uncaught, unspecified "error" event. ('+e+")");throw u.context=e,u}if(o(r=this._events[t]))return!1;if(n(r))switch(arguments.length){case 1:r.call(this);break;case 2:r.call(this,arguments[1]);break;case 3:r.call(this,arguments[1],arguments[2]);break;default:f=Array.prototype.slice.call(arguments,1),r.apply(this,f)}else if(i(r))for(f=Array.prototype.slice.call(arguments,1),a=(c=r.slice()).length,s=0;s<a;s++)c[s].apply(this,f);return!0},r.prototype.addListener=function(t,e){var a;if(!n(e))throw TypeError("listener must be a function");return this._events||(this._events={}),this._events.newListener&&this.emit("newListener",t,n(e.listener)?e.listener:e),this._events[t]?i(this._events[t])?this._events[t].push(e):this._events[t]=[this._events[t],e]:this._events[t]=e,i(this._events[t])&&!this._events[t].warned&&(a=o(this._maxListeners)?r.defaultMaxListeners:this._maxListeners)&&a>0&&this._events[t].length>a&&(this._events[t].warned=!0,console.error("(node) warning: possible EventEmitter memory leak detected. %d listeners added. Use emitter.setMaxListeners() to increase limit.",this._events[t].length),"function"==typeof console.trace&&console.trace()),this},r.prototype.on=r.prototype.addListener,r.prototype.once=function(t,e){if(!n(e))throw TypeError("listener must be a function");var r=!1;function i(){this.removeListener(t,i),r||(r=!0,e.apply(this,arguments))}return i.listener=e,this.on(t,i),this},r.prototype.removeListener=function(t,e){var r,o,a,f;if(!n(e))throw TypeError("listener must be a function");if(!this._events||!this._events[t])return this;if(a=(r=this._events[t]).length,o=-1,r===e||n(r.listener)&&r.listener===e)delete this._events[t],this._events.removeListener&&this.emit("removeListener",t,e);else if(i(r)){for(f=a;f-- >0;)if(r[f]===e||r[f].listener&&r[f].listener===e){o=f;break}if(o<0)return this;1===r.length?(r.length=0,delete this._events[t]):r.splice(o,1),this._events.removeListener&&this.emit("removeListener",t,e)}return this},r.prototype.removeAllListeners=function(t){var e,r;if(!this._events)return this;if(!this._events.removeListener)return 0===arguments.length?this._events={}:this._events[t]&&delete this._events[t],this;if(0===arguments.length){for(e in this._events)"removeListener"!==e&&this.removeAllListeners(e);return this.removeAllListeners("removeListener"),this._events={},this}if(n(r=this._events[t]))this.removeListener(t,r);else if(r)for(;r.length;)this.removeListener(t,r[r.length-1]);return delete this._events[t],this},r.prototype.listeners=function(t){return this._events&&this._events[t]?n(this._events[t])?[this._events[t]]:this._events[t].slice():[]},r.prototype.listenerCount=function(t){if(this._events){var e=this._events[t];if(n(e))return 1;if(e)return e.length}return 0},r.listenerCount=function(t,e){return t.listenerCount(e)}},function(t,e,r){(e=t.exports=r(39)).Stream=e,e.Readable=e,e.Writable=r(28),e.Duplex=r(10),e.Transform=r(42),e.PassThrough=r(84)},function(t,e,r){"use strict";(function(e,n,i){var o=r(19);function a(t){var e=this;this.next=null,this.entry=null,this.finish=function(){!function(t,e,r){var n=t.entry;for(t.entry=null;n;){var i=n.callback;e.pendingcb--,i(void 0),n=n.next}e.corkedRequestsFree?e.corkedRequestsFree.next=t:e.corkedRequestsFree=t}(e,t)}}t.exports=g;var f,s=!e.browser&&["v0.10","v0.9."].indexOf(e.version.slice(0,5))>-1?n:o.nextTick;g.WritableState=v;var c=r(14);c.inherits=r(0);var u,h={deprecate:r(83)},d=r(40),l=r(1).Buffer,p=i.Uint8Array||function(){},b=r(41);function y(){}function v(t,e){f=f||r(10),t=t||{};var n=e instanceof f;this.objectMode=!!t.objectMode,n&&(this.objectMode=this.objectMode||!!t.writableObjectMode);var i=t.highWaterMark,c=t.writableHighWaterMark,u=this.objectMode?16:16384;this.highWaterMark=i||0===i?i:n&&(c||0===c)?c:u,this.highWaterMark=Math.floor(this.highWaterMark),this.finalCalled=!1,this.needDrain=!1,this.ending=!1,this.ended=!1,this.finished=!1,this.destroyed=!1;var h=!1===t.decodeStrings;this.decodeStrings=!h,this.defaultEncoding=t.defaultEncoding||"utf8",this.length=0,this.writing=!1,this.corked=0,this.sync=!0,this.bufferProcessing=!1,this.onwrite=function(t){!function(t,e){var r=t._writableState,n=r.sync,i=r.writecb;if(function(t){t.writing=!1,t.writecb=null,t.length-=t.writelen,t.writelen=0}(r),e)!function(t,e,r,n,i){--e.pendingcb,r?(o.nextTick(i,n),o.nextTick(M,t,e),t._writableState.errorEmitted=!0,t.emit("error",n)):(i(n),t._writableState.errorEmitted=!0,t.emit("error",n),M(t,e))}(t,r,n,e,i);else{var a=S(r);a||r.corked||r.bufferProcessing||!r.bufferedRequest||w(t,r),n?s(_,t,r,a,i):_(t,r,a,i)}}(e,t)},this.writecb=null,this.writelen=0,this.bufferedRequest=null,this.lastBufferedRequest=null,this.pendingcb=0,this.prefinished=!1,this.errorEmitted=!1,this.bufferedRequestCount=0,this.corkedRequestsFree=new a(this)}function g(t){if(f=f||r(10),!(u.call(g,this)||this instanceof f))return new g(t);this._writableState=new v(t,this),this.writable=!0,t&&("function"==typeof t.write&&(this._write=t.write),"function"==typeof t.writev&&(this._writev=t.writev),"function"==typeof t.destroy&&(this._destroy=t.destroy),"function"==typeof t.final&&(this._final=t.final)),d.call(this)}function m(t,e,r,n,i,o,a){e.writelen=n,e.writecb=a,e.writing=!0,e.sync=!0,r?t._writev(i,e.onwrite):t._write(i,o,e.onwrite),e.sync=!1}function _(t,e,r,n){r||function(t,e){0===e.length&&e.needDrain&&(e.needDrain=!1,t.emit("drain"))}(t,e),e.pendingcb--,n(),M(t,e)}function w(t,e){e.bufferProcessing=!0;var r=e.bufferedRequest;if(t._writev&&r&&r.next){var n=e.bufferedRequestCount,i=new Array(n),o=e.corkedRequestsFree;o.entry=r;for(var f=0,s=!0;r;)i[f]=r,r.isBuf||(s=!1),r=r.next,f+=1;i.allBuffers=s,m(t,e,!0,e.length,i,"",o.finish),e.pendingcb++,e.lastBufferedRequest=null,o.next?(e.corkedRequestsFree=o.next,o.next=null):e.corkedRequestsFree=new a(e),e.bufferedRequestCount=0}else{for(;r;){var c=r.chunk,u=r.encoding,h=r.callback;if(m(t,e,!1,e.objectMode?1:c.length,c,u,h),r=r.next,e.bufferedRequestCount--,e.writing)break}null===r&&(e.lastBufferedRequest=null)}e.bufferedRequest=r,e.bufferProcessing=!1}function S(t){return t.ending&&0===t.length&&null===t.bufferedRequest&&!t.finished&&!t.writing}function E(t,e){t._final(function(r){e.pendingcb--,r&&t.emit("error",r),e.prefinished=!0,t.emit("prefinish"),M(t,e)})}function M(t,e){var r=S(e);return r&&(function(t,e){e.prefinished||e.finalCalled||("function"==typeof t._final?(e.pendingcb++,e.finalCalled=!0,o.nextTick(E,t,e)):(e.prefinished=!0,t.emit("prefinish")))}(t,e),0===e.pendingcb&&(e.finished=!0,t.emit("finish"))),r}c.inherits(g,d),v.prototype.getBuffer=function(){for(var t=this.bufferedRequest,e=[];t;)e.push(t),t=t.next;return e},function(){try{Object.defineProperty(v.prototype,"buffer",{get:h.deprecate(function(){return this.getBuffer()},"_writableState.buffer is deprecated. Use _writableState.getBuffer instead.","DEP0003")})}catch(t){}}(),"function"==typeof Symbol&&Symbol.hasInstance&&"function"==typeof Function.prototype[Symbol.hasInstance]?(u=Function.prototype[Symbol.hasInstance],Object.defineProperty(g,Symbol.hasInstance,{value:function(t){return!!u.call(this,t)||this===g&&t&&t._writableState instanceof v}})):u=function(t){return t instanceof this},g.prototype.pipe=function(){this.emit("error",new Error("Cannot pipe, not readable"))},g.prototype.write=function(t,e,r){var n=this._writableState,i=!1,a=!n.objectMode&&function(t){return l.isBuffer(t)||t instanceof p}(t);return a&&!l.isBuffer(t)&&(t=function(t){return l.from(t)}(t)),"function"==typeof e&&(r=e,e=null),a?e="buffer":e||(e=n.defaultEncoding),"function"!=typeof r&&(r=y),n.ended?function(t,e){var r=new Error("write after end");t.emit("error",r),o.nextTick(e,r)}(this,r):(a||function(t,e,r,n){var i=!0,a=!1;return null===r?a=new TypeError("May not write null values to stream"):"string"==typeof r||void 0===r||e.objectMode||(a=new TypeError("Invalid non-string/buffer chunk")),a&&(t.emit("error",a),o.nextTick(n,a),i=!1),i}(this,n,t,r))&&(n.pendingcb++,i=function(t,e,r,n,i,o){if(!r){var a=function(t,e,r){return t.objectMode||!1===t.decodeStrings||"string"!=typeof e||(e=l.from(e,r)),e}(e,n,i);n!==a&&(r=!0,i="buffer",n=a)}var f=e.objectMode?1:n.length;e.length+=f;var s=e.length<e.highWaterMark;if(s||(e.needDrain=!0),e.writing||e.corked){var c=e.lastBufferedRequest;e.lastBufferedRequest={chunk:n,encoding:i,isBuf:r,callback:o,next:null},c?c.next=e.lastBufferedRequest:e.bufferedRequest=e.lastBufferedRequest,e.bufferedRequestCount+=1}else m(t,e,!1,f,n,i,o);return s}(this,n,a,t,e,r)),i},g.prototype.cork=function(){this._writableState.corked++},g.prototype.uncork=function(){var t=this._writableState;t.corked&&(t.corked--,t.writing||t.corked||t.finished||t.bufferProcessing||!t.bufferedRequest||w(this,t))},g.prototype.setDefaultEncoding=function(t){if("string"==typeof t&&(t=t.toLowerCase()),!(["hex","utf8","utf-8","ascii","binary","base64","ucs2","ucs-2","utf16le","utf-16le","raw"].indexOf((t+"").toLowerCase())>-1))throw new TypeError("Unknown encoding: "+t);return this._writableState.defaultEncoding=t,this},Object.defineProperty(g.prototype,"writableHighWaterMark",{enumerable:!1,get:function(){return this._writableState.highWaterMark}}),g.prototype._write=function(t,e,r){r(new Error("_write() is not implemented"))},g.prototype._writev=null,g.prototype.end=function(t,e,r){var n=this._writableState;"function"==typeof t?(r=t,t=null,e=null):"function"==typeof e&&(r=e,e=null),null!==t&&void 0!==t&&this.write(t,e),n.corked&&(n.corked=1,this.uncork()),n.ending||n.finished||function(t,e,r){e.ending=!0,M(t,e),r&&(e.finished?o.nextTick(r):t.once("finish",r)),e.ended=!0,t.writable=!1}(this,n,r)},Object.defineProperty(g.prototype,"destroyed",{get:function(){return void 0!==this._writableState&&this._writableState.destroyed},set:function(t){this._writableState&&(this._writableState.destroyed=t)}}),g.prototype.destroy=b.destroy,g.prototype._undestroy=b.undestroy,g.prototype._destroy=function(t,e){this.end(),e(t)}}).call(this,r(8),r(81).setImmediate,r(7))},function(t,e,r){"use strict";var n=r(1).Buffer,i=n.isEncoding||function(t){switch((t=""+t)&&t.toLowerCase()){case"hex":case"utf8":case"utf-8":case"ascii":case"binary":case"base64":case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":case"raw":return!0;default:return!1}};function o(t){var e;switch(this.encoding=function(t){var e=function(t){if(!t)return"utf8";for(var e;;)switch(t){case"utf8":case"utf-8":return"utf8";case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return"utf16le";case"latin1":case"binary":return"latin1";case"base64":case"ascii":case"hex":return t;default:if(e)return;t=(""+t).toLowerCase(),e=!0}}(t);if("string"!=typeof e&&(n.isEncoding===i||!i(t)))throw new Error("Unknown encoding: "+t);return e||t}(t),this.encoding){case"utf16le":this.text=s,this.end=c,e=4;break;case"utf8":this.fillLast=f,e=4;break;case"base64":this.text=u,this.end=h,e=3;break;default:return this.write=d,void(this.end=l)}this.lastNeed=0,this.lastTotal=0,this.lastChar=n.allocUnsafe(e)}function a(t){return t<=127?0:t>>5==6?2:t>>4==14?3:t>>3==30?4:t>>6==2?-1:-2}function f(t){var e=this.lastTotal-this.lastNeed,r=function(t,e,r){if(128!=(192&e[0]))return t.lastNeed=0,"�";if(t.lastNeed>1&&e.length>1){if(128!=(192&e[1]))return t.lastNeed=1,"�";if(t.lastNeed>2&&e.length>2&&128!=(192&e[2]))return t.lastNeed=2,"�"}}(this,t);return void 0!==r?r:this.lastNeed<=t.length?(t.copy(this.lastChar,e,0,this.lastNeed),this.lastChar.toString(this.encoding,0,this.lastTotal)):(t.copy(this.lastChar,e,0,t.length),void(this.lastNeed-=t.length))}function s(t,e){if((t.length-e)%2==0){var r=t.toString("utf16le",e);if(r){var n=r.charCodeAt(r.length-1);if(n>=55296&&n<=56319)return this.lastNeed=2,this.lastTotal=4,this.lastChar[0]=t[t.length-2],this.lastChar[1]=t[t.length-1],r.slice(0,-1)}return r}return this.lastNeed=1,this.lastTotal=2,this.lastChar[0]=t[t.length-1],t.toString("utf16le",e,t.length-1)}function c(t){var e=t&&t.length?this.write(t):"";if(this.lastNeed){var r=this.lastTotal-this.lastNeed;return e+this.lastChar.toString("utf16le",0,r)}return e}function u(t,e){var r=(t.length-e)%3;return 0===r?t.toString("base64",e):(this.lastNeed=3-r,this.lastTotal=3,1===r?this.lastChar[0]=t[t.length-1]:(this.lastChar[0]=t[t.length-2],this.lastChar[1]=t[t.length-1]),t.toString("base64",e,t.length-r))}function h(t){var e=t&&t.length?this.write(t):"";return this.lastNeed?e+this.lastChar.toString("base64",0,3-this.lastNeed):e}function d(t){return t.toString(this.encoding)}function l(t){return t&&t.length?this.write(t):""}e.StringDecoder=o,o.prototype.write=function(t){if(0===t.length)return"";var e,r;if(this.lastNeed){if(void 0===(e=this.fillLast(t)))return"";r=this.lastNeed,this.lastNeed=0}else r=0;return r<t.length?e?e+this.text(t,r):this.text(t,r):e||""},o.prototype.end=function(t){var e=t&&t.length?this.write(t):"";return this.lastNeed?e+"�":e},o.prototype.text=function(t,e){var r=function(t,e,r){var n=e.length-1;if(n<r)return 0;var i=a(e[n]);return i>=0?(i>0&&(t.lastNeed=i-1),i):--n<r||-2===i?0:(i=a(e[n]))>=0?(i>0&&(t.lastNeed=i-2),i):--n<r||-2===i?0:(i=a(e[n]))>=0?(i>0&&(2===i?i=0:t.lastNeed=i-3),i):0}(this,t,e);if(!this.lastNeed)return t.toString("utf8",e);this.lastTotal=r;var n=t.length-(r-this.lastNeed);return t.copy(this.lastChar,0,n),t.toString("utf8",e,n)},o.prototype.fillLast=function(t){if(this.lastNeed<=t.length)return t.copy(this.lastChar,this.lastTotal-this.lastNeed,0,this.lastNeed),this.lastChar.toString(this.encoding,0,this.lastTotal);t.copy(this.lastChar,this.lastTotal-this.lastNeed,0,t.length),this.lastNeed-=t.length}},function(t,e,r){"use strict";var n=r(3).Buffer,i=r(0),o=r(38),a=new Array(16),f=[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,7,4,13,1,10,6,15,3,12,0,9,5,2,14,11,8,3,10,14,4,9,15,8,1,2,7,0,6,13,11,5,12,1,9,11,10,0,8,12,4,13,3,7,15,14,5,6,2,4,0,5,9,7,12,2,10,14,1,3,8,11,6,15,13],s=[5,14,7,0,9,2,11,4,13,6,15,8,1,10,3,12,6,11,3,7,0,13,5,10,14,15,8,12,4,9,1,2,15,5,1,3,7,14,6,9,11,8,12,2,10,0,4,13,8,6,4,1,3,11,15,0,5,12,2,13,9,7,10,14,12,15,10,4,1,5,8,7,6,2,13,14,0,3,9,11],c=[11,14,15,12,5,8,7,9,11,13,14,15,6,7,9,8,7,6,8,13,11,9,7,15,7,12,15,9,11,7,13,12,11,13,6,7,14,9,13,15,14,8,13,6,5,12,7,5,11,12,14,15,14,15,9,8,9,14,5,6,8,6,5,12,9,15,5,11,6,8,13,12,5,12,13,14,11,8,5,6],u=[8,9,9,11,13,15,15,5,7,7,8,11,14,14,12,6,9,13,15,7,12,8,9,11,7,7,12,7,6,15,13,11,9,7,15,11,8,6,6,14,12,13,5,14,13,13,7,5,15,5,8,11,14,14,6,14,6,9,12,9,12,5,15,8,8,5,12,9,12,5,14,6,8,13,6,5,15,13,11,11],h=[0,1518500249,1859775393,2400959708,2840853838],d=[1352829926,1548603684,1836072691,2053994217,0];function l(){o.call(this,64),this._a=1732584193,this._b=4023233417,this._c=2562383102,this._d=271733878,this._e=3285377520}function p(t,e){return t<<e|t>>>32-e}function b(t,e,r,n,i,o,a,f){return p(t+(e^r^n)+o+a|0,f)+i|0}function y(t,e,r,n,i,o,a,f){return p(t+(e&r|~e&n)+o+a|0,f)+i|0}function v(t,e,r,n,i,o,a,f){return p(t+((e|~r)^n)+o+a|0,f)+i|0}function g(t,e,r,n,i,o,a,f){return p(t+(e&n|r&~n)+o+a|0,f)+i|0}function m(t,e,r,n,i,o,a,f){return p(t+(e^(r|~n))+o+a|0,f)+i|0}i(l,o),l.prototype._update=function(){for(var t=a,e=0;e<16;++e)t[e]=this._block.readInt32LE(4*e);for(var r=0|this._a,n=0|this._b,i=0|this._c,o=0|this._d,l=0|this._e,_=0|this._a,w=0|this._b,S=0|this._c,E=0|this._d,M=0|this._e,A=0;A<80;A+=1){var x,k;A<16?(x=b(r,n,i,o,l,t[f[A]],h[0],c[A]),k=m(_,w,S,E,M,t[s[A]],d[0],u[A])):A<32?(x=y(r,n,i,o,l,t[f[A]],h[1],c[A]),k=g(_,w,S,E,M,t[s[A]],d[1],u[A])):A<48?(x=v(r,n,i,o,l,t[f[A]],h[2],c[A]),k=v(_,w,S,E,M,t[s[A]],d[2],u[A])):A<64?(x=g(r,n,i,o,l,t[f[A]],h[3],c[A]),k=y(_,w,S,E,M,t[s[A]],d[3],u[A])):(x=m(r,n,i,o,l,t[f[A]],h[4],c[A]),k=b(_,w,S,E,M,t[s[A]],d[4],u[A])),r=l,l=o,o=p(i,10),i=n,n=x,_=M,M=E,E=p(S,10),S=w,w=k}var I=this._b+i+E|0;this._b=this._c+o+M|0,this._c=this._d+l+_|0,this._d=this._e+r+w|0,this._e=this._a+n+S|0,this._a=I},l.prototype._digest=function(){this._block[this._blockOffset++]=128,this._blockOffset>56&&(this._block.fill(0,this._blockOffset,64),this._update(),this._blockOffset=0),this._block.fill(0,this._blockOffset,56),this._block.writeUInt32LE(this._length[0],56),this._block.writeUInt32LE(this._length[1],60),this._update();var t=n.alloc?n.alloc(20):new n(20);return t.writeInt32LE(this._a,0),t.writeInt32LE(this._b,4),t.writeInt32LE(this._c,8),t.writeInt32LE(this._d,12),t.writeInt32LE(this._e,16),t},t.exports=l},function(t,e,r){(e=t.exports=function(t){t=t.toLowerCase();var r=e[t];if(!r)throw new Error(t+" is not supported (we accept pull requests)");return new r}).sha=r(89),e.sha1=r(90),e.sha224=r(91),e.sha256=r(43),e.sha384=r(92),e.sha512=r(44)},function(t,e,r){"use strict";e.utils=r(98),e.Cipher=r(99),e.DES=r(100),e.CBC=r(101),e.EDE=r(102)},function(t,e,r){var n=r(103),i=r(111),o=r(54);e.createCipher=e.Cipher=n.createCipher,e.createCipheriv=e.Cipheriv=n.createCipheriv,e.createDecipher=e.Decipher=i.createDecipher,e.createDecipheriv=e.Decipheriv=i.createDecipheriv,e.listCiphers=e.getCiphers=function(){return Object.keys(o)}},function(t,e,r){var n={ECB:r(104),CBC:r(105),CFB:r(106),CFB8:r(107),CFB1:r(108),OFB:r(109),CTR:r(52),GCM:r(52)},i=r(54);for(var o in i)i[o].module=n[i[o].mode];t.exports=i},function(t,e,r){(function(e){var n=r(2),i=r(11);function o(t,r){var i=function(t){var e=a(t);return{blinder:e.toRed(n.mont(t.modulus)).redPow(new n(t.publicExponent)).fromRed(),unblinder:e.invm(t.modulus)}}(r),o=r.modulus.byteLength(),f=(n.mont(r.modulus),new n(t).mul(i.blinder).umod(r.modulus)),s=f.toRed(n.mont(r.prime1)),c=f.toRed(n.mont(r.prime2)),u=r.coefficient,h=r.prime1,d=r.prime2,l=s.redPow(r.exponent1),p=c.redPow(r.exponent2);l=l.fromRed(),p=p.fromRed();var b=l.isub(p).imul(u).umod(h);return b.imul(d),p.iadd(b),new e(p.imul(i.unblinder).umod(r.modulus).toArray(!1,o))}function a(t){for(var e=t.modulus.byteLength(),r=new n(i(e));r.cmp(t.modulus)>=0||!r.umod(t.prime1)||!r.umod(t.prime2);)r=new n(i(e));return r}t.exports=o,o.getr=a}).call(this,r(3).Buffer)},function(t,e,r){var n=e;n.utils=r(6),n.common=r(16),n.sha=r(128),n.ripemd=r(132),n.hmac=r(133),n.sha1=n.sha.sha1,n.sha256=n.sha.sha256,n.sha224=n.sha.sha224,n.sha384=n.sha.sha384,n.sha512=n.sha.sha512,n.ripemd160=n.ripemd.ripemd160},function(t,e){var r={}.toString;t.exports=Array.isArray||function(t){return"[object Array]"==r.call(t)}},function(t,e,r){"use strict";var n=r(1).Buffer,i=r(25).Transform;function o(t){i.call(this),this._block=n.allocUnsafe(t),this._blockSize=t,this._blockOffset=0,this._length=[0,0,0,0],this._finalized=!1}r(0)(o,i),o.prototype._transform=function(t,e,r){var n=null;try{this.update(t,e)}catch(t){n=t}r(n)},o.prototype._flush=function(t){var e=null;try{this.push(this.digest())}catch(t){e=t}t(e)},o.prototype.update=function(t,e){if(function(t,e){if(!n.isBuffer(t)&&"string"!=typeof t)throw new TypeError("Data must be a string or a buffer")}(t),this._finalized)throw new Error("Digest already called");n.isBuffer(t)||(t=n.from(t,e));for(var r=this._block,i=0;this._blockOffset+t.length-i>=this._blockSize;){for(var o=this._blockOffset;o<this._blockSize;)r[o++]=t[i++];this._update(),this._blockOffset=0}for(;i<t.length;)r[this._blockOffset++]=t[i++];for(var a=0,f=8*t.length;f>0;++a)this._length[a]+=f,(f=this._length[a]/4294967296|0)>0&&(this._length[a]-=4294967296*f);return this},o.prototype._update=function(){throw new Error("_update is not implemented")},o.prototype.digest=function(t){if(this._finalized)throw new Error("Digest already called");this._finalized=!0;var e=this._digest();void 0!==t&&(e=e.toString(t)),this._block.fill(0),this._blockOffset=0;for(var r=0;r<4;++r)this._length[r]=0;return e},o.prototype._digest=function(){throw new Error("_digest is not implemented")},t.exports=o},function(t,e,r){"use strict";(function(e,n){var i=r(19);t.exports=m;var o,a=r(37);m.ReadableState=g,r(26).EventEmitter;var f=function(t,e){return t.listeners(e).length},s=r(40),c=r(1).Buffer,u=e.Uint8Array||function(){},h=r(14);h.inherits=r(0);var d=r(78),l=void 0;l=d&&d.debuglog?d.debuglog("stream"):function(){};var p,b=r(79),y=r(41);h.inherits(m,s);var v=["error","close","destroy","pause","resume"];function g(t,e){o=o||r(10),t=t||{};var n=e instanceof o;this.objectMode=!!t.objectMode,n&&(this.objectMode=this.objectMode||!!t.readableObjectMode);var i=t.highWaterMark,a=t.readableHighWaterMark,f=this.objectMode?16:16384;this.highWaterMark=i||0===i?i:n&&(a||0===a)?a:f,this.highWaterMark=Math.floor(this.highWaterMark),this.buffer=new b,this.length=0,this.pipes=null,this.pipesCount=0,this.flowing=null,this.ended=!1,this.endEmitted=!1,this.reading=!1,this.sync=!0,this.needReadable=!1,this.emittedReadable=!1,this.readableListening=!1,this.resumeScheduled=!1,this.destroyed=!1,this.defaultEncoding=t.defaultEncoding||"utf8",this.awaitDrain=0,this.readingMore=!1,this.decoder=null,this.encoding=null,t.encoding&&(p||(p=r(29).StringDecoder),this.decoder=new p(t.encoding),this.encoding=t.encoding)}function m(t){if(o=o||r(10),!(this instanceof m))return new m(t);this._readableState=new g(t,this),this.readable=!0,t&&("function"==typeof t.read&&(this._read=t.read),"function"==typeof t.destroy&&(this._destroy=t.destroy)),s.call(this)}function _(t,e,r,n,i){var o,a=t._readableState;return null===e?(a.reading=!1,function(t,e){if(!e.ended){if(e.decoder){var r=e.decoder.end();r&&r.length&&(e.buffer.push(r),e.length+=e.objectMode?1:r.length)}e.ended=!0,M(t)}}(t,a)):(i||(o=function(t,e){var r;return function(t){return c.isBuffer(t)||t instanceof u}(e)||"string"==typeof e||void 0===e||t.objectMode||(r=new TypeError("Invalid non-string/buffer chunk")),r}(a,e)),o?t.emit("error",o):a.objectMode||e&&e.length>0?("string"==typeof e||a.objectMode||Object.getPrototypeOf(e)===c.prototype||(e=function(t){return c.from(t)}(e)),n?a.endEmitted?t.emit("error",new Error("stream.unshift() after end event")):w(t,a,e,!0):a.ended?t.emit("error",new Error("stream.push() after EOF")):(a.reading=!1,a.decoder&&!r?(e=a.decoder.write(e),a.objectMode||0!==e.length?w(t,a,e,!1):x(t,a)):w(t,a,e,!1))):n||(a.reading=!1)),function(t){return!t.ended&&(t.needReadable||t.length<t.highWaterMark||0===t.length)}(a)}function w(t,e,r,n){e.flowing&&0===e.length&&!e.sync?(t.emit("data",r),t.read(0)):(e.length+=e.objectMode?1:r.length,n?e.buffer.unshift(r):e.buffer.push(r),e.needReadable&&M(t)),x(t,e)}Object.defineProperty(m.prototype,"destroyed",{get:function(){return void 0!==this._readableState&&this._readableState.destroyed},set:function(t){this._readableState&&(this._readableState.destroyed=t)}}),m.prototype.destroy=y.destroy,m.prototype._undestroy=y.undestroy,m.prototype._destroy=function(t,e){this.push(null),e(t)},m.prototype.push=function(t,e){var r,n=this._readableState;return n.objectMode?r=!0:"string"==typeof t&&((e=e||n.defaultEncoding)!==n.encoding&&(t=c.from(t,e),e=""),r=!0),_(this,t,e,!1,r)},m.prototype.unshift=function(t){return _(this,t,null,!0,!1)},m.prototype.isPaused=function(){return!1===this._readableState.flowing},m.prototype.setEncoding=function(t){return p||(p=r(29).StringDecoder),this._readableState.decoder=new p(t),this._readableState.encoding=t,this};var S=8388608;function E(t,e){return t<=0||0===e.length&&e.ended?0:e.objectMode?1:t!=t?e.flowing&&e.length?e.buffer.head.data.length:e.length:(t>e.highWaterMark&&(e.highWaterMark=function(t){return t>=S?t=S:(t--,t|=t>>>1,t|=t>>>2,t|=t>>>4,t|=t>>>8,t|=t>>>16,t++),t}(t)),t<=e.length?t:e.ended?e.length:(e.needReadable=!0,0))}function M(t){var e=t._readableState;e.needReadable=!1,e.emittedReadable||(l("emitReadable",e.flowing),e.emittedReadable=!0,e.sync?i.nextTick(A,t):A(t))}function A(t){l("emit readable"),t.emit("readable"),R(t)}function x(t,e){e.readingMore||(e.readingMore=!0,i.nextTick(k,t,e))}function k(t,e){for(var r=e.length;!e.reading&&!e.flowing&&!e.ended&&e.length<e.highWaterMark&&(l("maybeReadMore read 0"),t.read(0),r!==e.length);)r=e.length;e.readingMore=!1}function I(t){l("readable nexttick read 0"),t.read(0)}function B(t,e){e.reading||(l("resume read 0"),t.read(0)),e.resumeScheduled=!1,e.awaitDrain=0,t.emit("resume"),R(t),e.flowing&&!e.reading&&t.read(0)}function R(t){var e=t._readableState;for(l("flow",e.flowing);e.flowing&&null!==t.read(););}function P(t,e){return 0===e.length?null:(e.objectMode?r=e.buffer.shift():!t||t>=e.length?(r=e.decoder?e.buffer.join(""):1===e.buffer.length?e.buffer.head.data:e.buffer.concat(e.length),e.buffer.clear()):r=function(t,e,r){var n;return t<e.head.data.length?(n=e.head.data.slice(0,t),e.head.data=e.head.data.slice(t)):n=t===e.head.data.length?e.shift():r?function(t,e){var r=e.head,n=1,i=r.data;for(t-=i.length;r=r.next;){var o=r.data,a=t>o.length?o.length:t;if(a===o.length?i+=o:i+=o.slice(0,t),0==(t-=a)){a===o.length?(++n,r.next?e.head=r.next:e.head=e.tail=null):(e.head=r,r.data=o.slice(a));break}++n}return e.length-=n,i}(t,e):function(t,e){var r=c.allocUnsafe(t),n=e.head,i=1;for(n.data.copy(r),t-=n.data.length;n=n.next;){var o=n.data,a=t>o.length?o.length:t;if(o.copy(r,r.length-t,0,a),0==(t-=a)){a===o.length?(++i,n.next?e.head=n.next:e.head=e.tail=null):(e.head=n,n.data=o.slice(a));break}++i}return e.length-=i,r}(t,e),n}(t,e.buffer,e.decoder),r);var r}function T(t){var e=t._readableState;if(e.length>0)throw new Error('"endReadable()" called on non-empty stream');e.endEmitted||(e.ended=!0,i.nextTick(L,e,t))}function L(t,e){t.endEmitted||0!==t.length||(t.endEmitted=!0,e.readable=!1,e.emit("end"))}function O(t,e){for(var r=0,n=t.length;r<n;r++)if(t[r]===e)return r;return-1}m.prototype.read=function(t){l("read",t),t=parseInt(t,10);var e=this._readableState,r=t;if(0!==t&&(e.emittedReadable=!1),0===t&&e.needReadable&&(e.length>=e.highWaterMark||e.ended))return l("read: emitReadable",e.length,e.ended),0===e.length&&e.ended?T(this):M(this),null;if(0===(t=E(t,e))&&e.ended)return 0===e.length&&T(this),null;var n,i=e.needReadable;return l("need readable",i),(0===e.length||e.length-t<e.highWaterMark)&&l("length less than watermark",i=!0),e.ended||e.reading?l("reading or ended",i=!1):i&&(l("do read"),e.reading=!0,e.sync=!0,0===e.length&&(e.needReadable=!0),this._read(e.highWaterMark),e.sync=!1,e.reading||(t=E(r,e))),null===(n=t>0?P(t,e):null)?(e.needReadable=!0,t=0):e.length-=t,0===e.length&&(e.ended||(e.needReadable=!0),r!==t&&e.ended&&T(this)),null!==n&&this.emit("data",n),n},m.prototype._read=function(t){this.emit("error",new Error("_read() is not implemented"))},m.prototype.pipe=function(t,e){var r=this,o=this._readableState;switch(o.pipesCount){case 0:o.pipes=t;break;case 1:o.pipes=[o.pipes,t];break;default:o.pipes.push(t)}o.pipesCount+=1,l("pipe count=%d opts=%j",o.pipesCount,e);var s=e&&!1===e.end||t===n.stdout||t===n.stderr?g:c;function c(){l("onend"),t.end()}o.endEmitted?i.nextTick(s):r.once("end",s),t.on("unpipe",function e(n,i){l("onunpipe"),n===r&&i&&!1===i.hasUnpiped&&(i.hasUnpiped=!0,l("cleanup"),t.removeListener("close",y),t.removeListener("finish",v),t.removeListener("drain",u),t.removeListener("error",b),t.removeListener("unpipe",e),r.removeListener("end",c),r.removeListener("end",g),r.removeListener("data",p),h=!0,!o.awaitDrain||t._writableState&&!t._writableState.needDrain||u())});var u=function(t){return function(){var e=t._readableState;l("pipeOnDrain",e.awaitDrain),e.awaitDrain&&e.awaitDrain--,0===e.awaitDrain&&f(t,"data")&&(e.flowing=!0,R(t))}}(r);t.on("drain",u);var h=!1,d=!1;function p(e){l("ondata"),d=!1,!1!==t.write(e)||d||((1===o.pipesCount&&o.pipes===t||o.pipesCount>1&&-1!==O(o.pipes,t))&&!h&&(l("false write response, pause",r._readableState.awaitDrain),r._readableState.awaitDrain++,d=!0),r.pause())}function b(e){l("onerror",e),g(),t.removeListener("error",b),0===f(t,"error")&&t.emit("error",e)}function y(){t.removeListener("finish",v),g()}function v(){l("onfinish"),t.removeListener("close",y),g()}function g(){l("unpipe"),r.unpipe(t)}return r.on("data",p),function(t,e,r){if("function"==typeof t.prependListener)return t.prependListener(e,r);t._events&&t._events[e]?a(t._events[e])?t._events[e].unshift(r):t._events[e]=[r,t._events[e]]:t.on(e,r)}(t,"error",b),t.once("close",y),t.once("finish",v),t.emit("pipe",r),o.flowing||(l("pipe resume"),r.resume()),t},m.prototype.unpipe=function(t){var e=this._readableState,r={hasUnpiped:!1};if(0===e.pipesCount)return this;if(1===e.pipesCount)return t&&t!==e.pipes?this:(t||(t=e.pipes),e.pipes=null,e.pipesCount=0,e.flowing=!1,t&&t.emit("unpipe",this,r),this);if(!t){var n=e.pipes,i=e.pipesCount;e.pipes=null,e.pipesCount=0,e.flowing=!1;for(var o=0;o<i;o++)n[o].emit("unpipe",this,r);return this}var a=O(e.pipes,t);return-1===a?this:(e.pipes.splice(a,1),e.pipesCount-=1,1===e.pipesCount&&(e.pipes=e.pipes[0]),t.emit("unpipe",this,r),this)},m.prototype.on=function(t,e){var r=s.prototype.on.call(this,t,e);if("data"===t)!1!==this._readableState.flowing&&this.resume();else if("readable"===t){var n=this._readableState;n.endEmitted||n.readableListening||(n.readableListening=n.needReadable=!0,n.emittedReadable=!1,n.reading?n.length&&M(this):i.nextTick(I,this))}return r},m.prototype.addListener=m.prototype.on,m.prototype.resume=function(){var t=this._readableState;return t.flowing||(l("resume"),t.flowing=!0,function(t,e){e.resumeScheduled||(e.resumeScheduled=!0,i.nextTick(B,t,e))}(this,t)),this},m.prototype.pause=function(){return l("call pause flowing=%j",this._readableState.flowing),!1!==this._readableState.flowing&&(l("pause"),this._readableState.flowing=!1,this.emit("pause")),this},m.prototype.wrap=function(t){var e=this,r=this._readableState,n=!1;for(var i in t.on("end",function(){if(l("wrapped end"),r.decoder&&!r.ended){var t=r.decoder.end();t&&t.length&&e.push(t)}e.push(null)}),t.on("data",function(i){l("wrapped data"),r.decoder&&(i=r.decoder.write(i)),(!r.objectMode||null!==i&&void 0!==i)&&(r.objectMode||i&&i.length)&&(e.push(i)||(n=!0,t.pause()))}),t)void 0===this[i]&&"function"==typeof t[i]&&(this[i]=function(e){return function(){return t[e].apply(t,arguments)}}(i));for(var o=0;o<v.length;o++)t.on(v[o],this.emit.bind(this,v[o]));return this._read=function(e){l("wrapped _read",e),n&&(n=!1,t.resume())},this},Object.defineProperty(m.prototype,"readableHighWaterMark",{enumerable:!1,get:function(){return this._readableState.highWaterMark}}),m._fromList=P}).call(this,r(7),r(8))},function(t,e,r){t.exports=r(26).EventEmitter},function(t,e,r){"use strict";var n=r(19);function i(t,e){t.emit("error",e)}t.exports={destroy:function(t,e){var r=this,o=this._readableState&&this._readableState.destroyed,a=this._writableState&&this._writableState.destroyed;return o||a?(e?e(t):!t||this._writableState&&this._writableState.errorEmitted||n.nextTick(i,this,t),this):(this._readableState&&(this._readableState.destroyed=!0),this._writableState&&(this._writableState.destroyed=!0),this._destroy(t||null,function(t){!e&&t?(n.nextTick(i,r,t),r._writableState&&(r._writableState.errorEmitted=!0)):e&&e(t)}),this)},undestroy:function(){this._readableState&&(this._readableState.destroyed=!1,this._readableState.reading=!1,this._readableState.ended=!1,this._readableState.endEmitted=!1),this._writableState&&(this._writableState.destroyed=!1,this._writableState.ended=!1,this._writableState.ending=!1,this._writableState.finished=!1,this._writableState.errorEmitted=!1)}}},function(t,e,r){"use strict";t.exports=o;var n=r(10),i=r(14);function o(t){if(!(this instanceof o))return new o(t);n.call(this,t),this._transformState={afterTransform:function(t,e){var r=this._transformState;r.transforming=!1;var n=r.writecb;if(!n)return this.emit("error",new Error("write callback called multiple times"));r.writechunk=null,r.writecb=null,null!=e&&this.push(e),n(t);var i=this._readableState;i.reading=!1,(i.needReadable||i.length<i.highWaterMark)&&this._read(i.highWaterMark)}.bind(this),needTransform:!1,transforming:!1,writecb:null,writechunk:null,writeencoding:null},this._readableState.needReadable=!0,this._readableState.sync=!1,t&&("function"==typeof t.transform&&(this._transform=t.transform),"function"==typeof t.flush&&(this._flush=t.flush)),this.on("prefinish",a)}function a(){var t=this;"function"==typeof this._flush?this._flush(function(e,r){f(t,e,r)}):f(this,null,null)}function f(t,e,r){if(e)return t.emit("error",e);if(null!=r&&t.push(r),t._writableState.length)throw new Error("Calling transform done when ws.length != 0");if(t._transformState.transforming)throw new Error("Calling transform done when still transforming");return t.push(null)}i.inherits=r(0),i.inherits(o,n),o.prototype.push=function(t,e){return this._transformState.needTransform=!1,n.prototype.push.call(this,t,e)},o.prototype._transform=function(t,e,r){throw new Error("_transform() is not implemented")},o.prototype._write=function(t,e,r){var n=this._transformState;if(n.writecb=r,n.writechunk=t,n.writeencoding=e,!n.transforming){var i=this._readableState;(n.needTransform||i.needReadable||i.length<i.highWaterMark)&&this._read(i.highWaterMark)}},o.prototype._read=function(t){var e=this._transformState;null!==e.writechunk&&e.writecb&&!e.transforming?(e.transforming=!0,this._transform(e.writechunk,e.writeencoding,e.afterTransform)):e.needTransform=!0},o.prototype._destroy=function(t,e){var r=this;n.prototype._destroy.call(this,t,function(t){e(t),r.emit("close")})}},function(t,e,r){var n=r(0),i=r(12),o=r(1).Buffer,a=[1116352408,1899447441,3049323471,3921009573,961987163,1508970993,2453635748,2870763221,3624381080,310598401,607225278,1426881987,1925078388,2162078206,2614888103,3248222580,3835390401,4022224774,264347078,604807628,770255983,1249150122,1555081692,1996064986,2554220882,2821834349,2952996808,3210313671,3336571891,3584528711,113926993,338241895,666307205,773529912,1294757372,1396182291,1695183700,1986661051,2177026350,2456956037,2730485921,2820302411,3259730800,3345764771,3516065817,3600352804,4094571909,275423344,430227734,506948616,659060556,883997877,958139571,1322822218,1537002063,1747873779,1955562222,2024104815,2227730452,2361852424,2428436474,2756734187,3204031479,3329325298],f=new Array(64);function s(){this.init(),this._w=f,i.call(this,64,56)}function c(t,e,r){return r^t&(e^r)}function u(t,e,r){return t&e|r&(t|e)}function h(t){return(t>>>2|t<<30)^(t>>>13|t<<19)^(t>>>22|t<<10)}function d(t){return(t>>>6|t<<26)^(t>>>11|t<<21)^(t>>>25|t<<7)}function l(t){return(t>>>7|t<<25)^(t>>>18|t<<14)^t>>>3}function p(t){return(t>>>17|t<<15)^(t>>>19|t<<13)^t>>>10}n(s,i),s.prototype.init=function(){return this._a=1779033703,this._b=3144134277,this._c=1013904242,this._d=2773480762,this._e=1359893119,this._f=2600822924,this._g=528734635,this._h=1541459225,this},s.prototype._update=function(t){for(var e=this._w,r=0|this._a,n=0|this._b,i=0|this._c,o=0|this._d,f=0|this._e,s=0|this._f,b=0|this._g,y=0|this._h,v=0;v<16;++v)e[v]=t.readInt32BE(4*v);for(;v<64;++v)e[v]=p(e[v-2])+e[v-7]+l(e[v-15])+e[v-16]|0;for(var g=0;g<64;++g){var m=y+d(f)+c(f,s,b)+a[g]+e[g]|0,_=h(r)+u(r,n,i)|0;y=b,b=s,s=f,f=o+m|0,o=i,i=n,n=r,r=m+_|0}this._a=r+this._a|0,this._b=n+this._b|0,this._c=i+this._c|0,this._d=o+this._d|0,this._e=f+this._e|0,this._f=s+this._f|0,this._g=b+this._g|0,this._h=y+this._h|0},s.prototype._hash=function(){var t=o.allocUnsafe(32);return t.writeInt32BE(this._a,0),t.writeInt32BE(this._b,4),t.writeInt32BE(this._c,8),t.writeInt32BE(this._d,12),t.writeInt32BE(this._e,16),t.writeInt32BE(this._f,20),t.writeInt32BE(this._g,24),t.writeInt32BE(this._h,28),t},t.exports=s},function(t,e,r){var n=r(0),i=r(12),o=r(1).Buffer,a=[1116352408,3609767458,1899447441,602891725,3049323471,3964484399,3921009573,2173295548,961987163,4081628472,1508970993,3053834265,2453635748,2937671579,2870763221,3664609560,3624381080,2734883394,310598401,1164996542,607225278,1323610764,1426881987,3590304994,1925078388,4068182383,2162078206,991336113,2614888103,633803317,3248222580,3479774868,3835390401,2666613458,4022224774,944711139,264347078,2341262773,604807628,2007800933,770255983,1495990901,1249150122,1856431235,1555081692,3175218132,1996064986,2198950837,2554220882,3999719339,2821834349,766784016,2952996808,2566594879,3210313671,3203337956,3336571891,1034457026,3584528711,2466948901,113926993,3758326383,338241895,168717936,666307205,1188179964,773529912,1546045734,1294757372,1522805485,1396182291,2643833823,1695183700,2343527390,1986661051,1014477480,2177026350,1206759142,2456956037,344077627,2730485921,1290863460,2820302411,3158454273,3259730800,3505952657,3345764771,106217008,3516065817,3606008344,3600352804,1432725776,4094571909,1467031594,275423344,851169720,430227734,3100823752,506948616,1363258195,659060556,3750685593,883997877,3785050280,958139571,3318307427,1322822218,3812723403,1537002063,2003034995,1747873779,3602036899,1955562222,1575990012,2024104815,1125592928,2227730452,2716904306,2361852424,442776044,2428436474,593698344,2756734187,3733110249,3204031479,2999351573,3329325298,3815920427,3391569614,3928383900,3515267271,566280711,3940187606,3454069534,4118630271,4000239992,116418474,1914138554,174292421,2731055270,289380356,3203993006,460393269,320620315,685471733,587496836,852142971,1086792851,1017036298,365543100,1126000580,2618297676,1288033470,3409855158,1501505948,4234509866,1607167915,987167468,1816402316,1246189591],f=new Array(160);function s(){this.init(),this._w=f,i.call(this,128,112)}function c(t,e,r){return r^t&(e^r)}function u(t,e,r){return t&e|r&(t|e)}function h(t,e){return(t>>>28|e<<4)^(e>>>2|t<<30)^(e>>>7|t<<25)}function d(t,e){return(t>>>14|e<<18)^(t>>>18|e<<14)^(e>>>9|t<<23)}function l(t,e){return(t>>>1|e<<31)^(t>>>8|e<<24)^t>>>7}function p(t,e){return(t>>>1|e<<31)^(t>>>8|e<<24)^(t>>>7|e<<25)}function b(t,e){return(t>>>19|e<<13)^(e>>>29|t<<3)^t>>>6}function y(t,e){return(t>>>19|e<<13)^(e>>>29|t<<3)^(t>>>6|e<<26)}function v(t,e){return t>>>0<e>>>0?1:0}n(s,i),s.prototype.init=function(){return this._ah=1779033703,this._bh=3144134277,this._ch=1013904242,this._dh=2773480762,this._eh=1359893119,this._fh=2600822924,this._gh=528734635,this._hh=1541459225,this._al=4089235720,this._bl=2227873595,this._cl=4271175723,this._dl=1595750129,this._el=2917565137,this._fl=725511199,this._gl=4215389547,this._hl=327033209,this},s.prototype._update=function(t){for(var e=this._w,r=0|this._ah,n=0|this._bh,i=0|this._ch,o=0|this._dh,f=0|this._eh,s=0|this._fh,g=0|this._gh,m=0|this._hh,_=0|this._al,w=0|this._bl,S=0|this._cl,E=0|this._dl,M=0|this._el,A=0|this._fl,x=0|this._gl,k=0|this._hl,I=0;I<32;I+=2)e[I]=t.readInt32BE(4*I),e[I+1]=t.readInt32BE(4*I+4);for(;I<160;I+=2){var B=e[I-30],R=e[I-30+1],P=l(B,R),T=p(R,B),L=b(B=e[I-4],R=e[I-4+1]),O=y(R,B),C=e[I-14],j=e[I-14+1],N=e[I-32],D=e[I-32+1],U=T+j|0,q=P+C+v(U,T)|0;q=(q=q+L+v(U=U+O|0,O)|0)+N+v(U=U+D|0,D)|0,e[I]=q,e[I+1]=U}for(var z=0;z<160;z+=2){q=e[z],U=e[z+1];var F=u(r,n,i),K=u(_,w,S),Y=h(r,_),V=h(_,r),H=d(f,M),W=d(M,f),G=a[z],X=a[z+1],J=c(f,s,g),Z=c(M,A,x),$=k+W|0,Q=m+H+v($,k)|0;Q=(Q=(Q=Q+J+v($=$+Z|0,Z)|0)+G+v($=$+X|0,X)|0)+q+v($=$+U|0,U)|0;var tt=V+K|0,et=Y+F+v(tt,V)|0;m=g,k=x,g=s,x=A,s=f,A=M,f=o+Q+v(M=E+$|0,E)|0,o=i,E=S,i=n,S=w,n=r,w=_,r=Q+et+v(_=$+tt|0,$)|0}this._al=this._al+_|0,this._bl=this._bl+w|0,this._cl=this._cl+S|0,this._dl=this._dl+E|0,this._el=this._el+M|0,this._fl=this._fl+A|0,this._gl=this._gl+x|0,this._hl=this._hl+k|0,this._ah=this._ah+r+v(this._al,_)|0,this._bh=this._bh+n+v(this._bl,w)|0,this._ch=this._ch+i+v(this._cl,S)|0,this._dh=this._dh+o+v(this._dl,E)|0,this._eh=this._eh+f+v(this._el,M)|0,this._fh=this._fh+s+v(this._fl,A)|0,this._gh=this._gh+g+v(this._gl,x)|0,this._hh=this._hh+m+v(this._hl,k)|0},s.prototype._hash=function(){var t=o.allocUnsafe(64);function e(e,r,n){t.writeInt32BE(e,n),t.writeInt32BE(r,n+4)}return e(this._ah,this._al,0),e(this._bh,this._bl,8),e(this._ch,this._cl,16),e(this._dh,this._dl,24),e(this._eh,this._el,32),e(this._fh,this._fl,40),e(this._gh,this._gl,48),e(this._hh,this._hl,56),t},t.exports=s},function(t,e,r){"use strict";var n=r(0),i=r(93),o=r(9),a=r(1).Buffer,f=r(46),s=r(30),c=r(31),u=a.alloc(128);function h(t,e){o.call(this,"digest"),"string"==typeof e&&(e=a.from(e));var r="sha512"===t||"sha384"===t?128:64;this._alg=t,this._key=e,e.length>r?e=("rmd160"===t?new s:c(t)).update(e).digest():e.length<r&&(e=a.concat([e,u],r));for(var n=this._ipad=a.allocUnsafe(r),i=this._opad=a.allocUnsafe(r),f=0;f<r;f++)n[f]=54^e[f],i[f]=92^e[f];this._hash="rmd160"===t?new s:c(t),this._hash.update(n)}n(h,o),h.prototype._update=function(t){this._hash.update(t)},h.prototype._final=function(){var t=this._hash.digest();return("rmd160"===this._alg?new s:c(this._alg)).update(this._opad).update(t).digest()},t.exports=function(t,e){return"rmd160"===(t=t.toLowerCase())||"ripemd160"===t?new h("rmd160",e):"md5"===t?new i(f,e):new h(t,e)}},function(t,e,r){var n=r(24);t.exports=function(t){return(new n).update(t).digest()}},function(t){t.exports={sha224WithRSAEncryption:{sign:"rsa",hash:"sha224",id:"302d300d06096086480165030402040500041c"},"RSA-SHA224":{sign:"ecdsa/rsa",hash:"sha224",id:"302d300d06096086480165030402040500041c"},sha256WithRSAEncryption:{sign:"rsa",hash:"sha256",id:"3031300d060960864801650304020105000420"},"RSA-SHA256":{sign:"ecdsa/rsa",hash:"sha256",id:"3031300d060960864801650304020105000420"},sha384WithRSAEncryption:{sign:"rsa",hash:"sha384",id:"3041300d060960864801650304020205000430"},"RSA-SHA384":{sign:"ecdsa/rsa",hash:"sha384",id:"3041300d060960864801650304020205000430"},sha512WithRSAEncryption:{sign:"rsa",hash:"sha512",id:"3051300d060960864801650304020305000440"},"RSA-SHA512":{sign:"ecdsa/rsa",hash:"sha512",id:"3051300d060960864801650304020305000440"},"RSA-SHA1":{sign:"rsa",hash:"sha1",id:"3021300906052b0e03021a05000414"},"ecdsa-with-SHA1":{sign:"ecdsa",hash:"sha1",id:""},sha256:{sign:"ecdsa",hash:"sha256",id:""},sha224:{sign:"ecdsa",hash:"sha224",id:""},sha384:{sign:"ecdsa",hash:"sha384",id:""},sha512:{sign:"ecdsa",hash:"sha512",id:""},"DSA-SHA":{sign:"dsa",hash:"sha1",id:""},"DSA-SHA1":{sign:"dsa",hash:"sha1",id:""},DSA:{sign:"dsa",hash:"sha1",id:""},"DSA-WITH-SHA224":{sign:"dsa",hash:"sha224",id:""},"DSA-SHA224":{sign:"dsa",hash:"sha224",id:""},"DSA-WITH-SHA256":{sign:"dsa",hash:"sha256",id:""},"DSA-SHA256":{sign:"dsa",hash:"sha256",id:""},"DSA-WITH-SHA384":{sign:"dsa",hash:"sha384",id:""},"DSA-SHA384":{sign:"dsa",hash:"sha384",id:""},"DSA-WITH-SHA512":{sign:"dsa",hash:"sha512",id:""},"DSA-SHA512":{sign:"dsa",hash:"sha512",id:""},"DSA-RIPEMD160":{sign:"dsa",hash:"rmd160",id:""},ripemd160WithRSA:{sign:"rsa",hash:"rmd160",id:"3021300906052b2403020105000414"},"RSA-RIPEMD160":{sign:"rsa",hash:"rmd160",id:"3021300906052b2403020105000414"},md5WithRSAEncryption:{sign:"rsa",hash:"md5",id:"3020300c06082a864886f70d020505000410"},"RSA-MD5":{sign:"rsa",hash:"md5",id:"3020300c06082a864886f70d020505000410"}}},function(t,e,r){e.pbkdf2=r(95),e.pbkdf2Sync=r(51)},function(t,e,r){(function(e){var r=Math.pow(2,30)-1;function n(t,r){if("string"!=typeof t&&!e.isBuffer(t))throw new TypeError(r+" must be a buffer or string")}t.exports=function(t,e,i,o){if(n(t,"Password"),n(e,"Salt"),"number"!=typeof i)throw new TypeError("Iterations not a number");if(i<0)throw new TypeError("Bad iterations");if("number"!=typeof o)throw new TypeError("Key length not a number");if(o<0||o>r||o!=o)throw new TypeError("Bad key length")}}).call(this,r(3).Buffer)},function(t,e,r){(function(e){var r;r=e.browser?"utf-8":parseInt(e.version.split(".")[0].slice(1),10)>=6?"utf-8":"binary",t.exports=r}).call(this,r(8))},function(t,e,r){var n=r(46),i=r(30),o=r(31),a=r(49),f=r(50),s=r(1).Buffer,c=s.alloc(128),u={md5:16,sha1:20,sha224:28,sha256:32,sha384:48,sha512:64,rmd160:20,ripemd160:20};function h(t,e,r){var a=function(t){return"rmd160"===t||"ripemd160"===t?function(t){return(new i).update(t).digest()}:"md5"===t?n:function(e){return o(t).update(e).digest()}}(t),f="sha512"===t||"sha384"===t?128:64;e.length>f?e=a(e):e.length<f&&(e=s.concat([e,c],f));for(var h=s.allocUnsafe(f+u[t]),d=s.allocUnsafe(f+u[t]),l=0;l<f;l++)h[l]=54^e[l],d[l]=92^e[l];var p=s.allocUnsafe(f+r+4);h.copy(p,0,0,f),this.ipad1=p,this.ipad2=h,this.opad=d,this.alg=t,this.blocksize=f,this.hash=a,this.size=u[t]}h.prototype.run=function(t,e){return t.copy(e,this.blocksize),this.hash(e).copy(this.opad,this.blocksize),this.hash(this.opad)},t.exports=function(t,e,r,n,i){a(t,e,r,n),s.isBuffer(t)||(t=s.from(t,f)),s.isBuffer(e)||(e=s.from(e,f));var o=new h(i=i||"sha1",t,e.length),c=s.allocUnsafe(n),d=s.allocUnsafe(e.length+4);e.copy(d,0,0,e.length);for(var l=0,p=u[i],b=Math.ceil(n/p),y=1;y<=b;y++){d.writeUInt32BE(y,e.length);for(var v=o.run(d,o.ipad1),g=v,m=1;m<r;m++){g=o.run(g,o.ipad2);for(var _=0;_<p;_++)v[_]^=g[_]}v.copy(c,l),l+=p}return c}},function(t,e,r){var n=r(15),i=r(1).Buffer,o=r(53);function a(t){var e=t._cipher.encryptBlockRaw(t._prev);return o(t._prev),e}e.encrypt=function(t,e){var r=Math.ceil(e.length/16),o=t._cache.length;t._cache=i.concat([t._cache,i.allocUnsafe(16*r)]);for(var f=0;f<r;f++){var s=a(t),c=o+16*f;t._cache.writeUInt32BE(s[0],c+0),t._cache.writeUInt32BE(s[1],c+4),t._cache.writeUInt32BE(s[2],c+8),t._cache.writeUInt32BE(s[3],c+12)}var u=t._cache.slice(0,e.length);return t._cache=t._cache.slice(e.length),n(e,u)}},function(t,e){t.exports=function(t){for(var e,r=t.length;r--;){if(255!==(e=t.readUInt8(r))){e++,t.writeUInt8(e,r);break}t.writeUInt8(0,r)}}},function(t){t.exports={"aes-128-ecb":{cipher:"AES",key:128,iv:0,mode:"ECB",type:"block"},"aes-192-ecb":{cipher:"AES",key:192,iv:0,mode:"ECB",type:"block"},"aes-256-ecb":{cipher:"AES",key:256,iv:0,mode:"ECB",type:"block"},"aes-128-cbc":{cipher:"AES",key:128,iv:16,mode:"CBC",type:"block"},"aes-192-cbc":{cipher:"AES",key:192,iv:16,mode:"CBC",type:"block"},"aes-256-cbc":{cipher:"AES",key:256,iv:16,mode:"CBC",type:"block"},aes128:{cipher:"AES",key:128,iv:16,mode:"CBC",type:"block"},aes192:{cipher:"AES",key:192,iv:16,mode:"CBC",type:"block"},aes256:{cipher:"AES",key:256,iv:16,mode:"CBC",type:"block"},"aes-128-cfb":{cipher:"AES",key:128,iv:16,mode:"CFB",type:"stream"},"aes-192-cfb":{cipher:"AES",key:192,iv:16,mode:"CFB",type:"stream"},"aes-256-cfb":{cipher:"AES",key:256,iv:16,mode:"CFB",type:"stream"},"aes-128-cfb8":{cipher:"AES",key:128,iv:16,mode:"CFB8",type:"stream"},"aes-192-cfb8":{cipher:"AES",key:192,iv:16,mode:"CFB8",type:"stream"},"aes-256-cfb8":{cipher:"AES",key:256,iv:16,mode:"CFB8",type:"stream"},"aes-128-cfb1":{cipher:"AES",key:128,iv:16,mode:"CFB1",type:"stream"},"aes-192-cfb1":{cipher:"AES",key:192,iv:16,mode:"CFB1",type:"stream"},"aes-256-cfb1":{cipher:"AES",key:256,iv:16,mode:"CFB1",type:"stream"},"aes-128-ofb":{cipher:"AES",key:128,iv:16,mode:"OFB",type:"stream"},"aes-192-ofb":{cipher:"AES",key:192,iv:16,mode:"OFB",type:"stream"},"aes-256-ofb":{cipher:"AES",key:256,iv:16,mode:"OFB",type:"stream"},"aes-128-ctr":{cipher:"AES",key:128,iv:16,mode:"CTR",type:"stream"},"aes-192-ctr":{cipher:"AES",key:192,iv:16,mode:"CTR",type:"stream"},"aes-256-ctr":{cipher:"AES",key:256,iv:16,mode:"CTR",type:"stream"},"aes-128-gcm":{cipher:"AES",key:128,iv:12,mode:"GCM",type:"auth"},"aes-192-gcm":{cipher:"AES",key:192,iv:12,mode:"GCM",type:"auth"},"aes-256-gcm":{cipher:"AES",key:256,iv:12,mode:"GCM",type:"auth"}}},function(t,e,r){var n=r(20),i=r(1).Buffer,o=r(9),a=r(0),f=r(110),s=r(15),c=r(53);function u(t,e,r,a){o.call(this);var s=i.alloc(4,0);this._cipher=new n.AES(e);var u=this._cipher.encryptBlock(s);this._ghash=new f(u),r=function(t,e,r){if(12===e.length)return t._finID=i.concat([e,i.from([0,0,0,1])]),i.concat([e,i.from([0,0,0,2])]);var n=new f(r),o=e.length,a=o%16;n.update(e),a&&(a=16-a,n.update(i.alloc(a,0))),n.update(i.alloc(8,0));var s=8*o,u=i.alloc(8);u.writeUIntBE(s,0,8),n.update(u),t._finID=n.state;var h=i.from(t._finID);return c(h),h}(this,r,u),this._prev=i.from(r),this._cache=i.allocUnsafe(0),this._secCache=i.allocUnsafe(0),this._decrypt=a,this._alen=0,this._len=0,this._mode=t,this._authTag=null,this._called=!1}a(u,o),u.prototype._update=function(t){if(!this._called&&this._alen){var e=16-this._alen%16;e<16&&(e=i.alloc(e,0),this._ghash.update(e))}this._called=!0;var r=this._mode.encrypt(this,t);return this._decrypt?this._ghash.update(t):this._ghash.update(r),this._len+=t.length,r},u.prototype._final=function(){if(this._decrypt&&!this._authTag)throw new Error("Unsupported state or unable to authenticate data");var t=s(this._ghash.final(8*this._alen,8*this._len),this._cipher.encryptBlock(this._finID));if(this._decrypt&&function(t,e){var r=0;t.length!==e.length&&r++;for(var n=Math.min(t.length,e.length),i=0;i<n;++i)r+=t[i]^e[i];return r}(t,this._authTag))throw new Error("Unsupported state or unable to authenticate data");this._authTag=t,this._cipher.scrub()},u.prototype.getAuthTag=function(){if(this._decrypt||!i.isBuffer(this._authTag))throw new Error("Attempting to get auth tag in unsupported state");return this._authTag},u.prototype.setAuthTag=function(t){if(!this._decrypt)throw new Error("Attempting to set auth tag in unsupported state");this._authTag=t},u.prototype.setAAD=function(t){if(this._called)throw new Error("Attempting to set AAD in unsupported state");this._ghash.update(t),this._alen+=t.length},t.exports=u},function(t,e,r){var n=r(20),i=r(1).Buffer,o=r(9);function a(t,e,r,a){o.call(this),this._cipher=new n.AES(e),this._prev=i.from(r),this._cache=i.allocUnsafe(0),this._secCache=i.allocUnsafe(0),this._decrypt=a,this._mode=t}r(0)(a,o),a.prototype._update=function(t){return this._mode.encrypt(this,t,this._decrypt)},a.prototype._final=function(){this._cipher.scrub()},t.exports=a},function(t,e,r){var n=r(11);t.exports=v,v.simpleSieve=b,v.fermatTest=y;var i=r(2),o=new i(24),a=new(r(58)),f=new i(1),s=new i(2),c=new i(5),u=(new i(16),new i(8),new i(10)),h=new i(3),d=(new i(7),new i(11)),l=new i(4),p=(new i(12),null);function b(t){for(var e=function(){if(null!==p)return p;var t=[];t[0]=2;for(var e=1,r=3;r<1048576;r+=2){for(var n=Math.ceil(Math.sqrt(r)),i=0;i<e&&t[i]<=n&&r%t[i]!=0;i++);e!==i&&t[i]<=n||(t[e++]=r)}return p=t,t}(),r=0;r<e.length;r++)if(0===t.modn(e[r]))return 0===t.cmpn(e[r]);return!0}function y(t){var e=i.mont(t);return 0===s.toRed(e).redPow(t.subn(1)).fromRed().cmpn(1)}function v(t,e){if(t<16)return new i(2===e||5===e?[140,123]:[140,39]);var r,p;for(e=new i(e);;){for(r=new i(n(Math.ceil(t/8)));r.bitLength()>t;)r.ishrn(1);if(r.isEven()&&r.iadd(f),r.testn(1)||r.iadd(s),e.cmp(s)){if(!e.cmp(c))for(;r.mod(u).cmp(h);)r.iadd(l)}else for(;r.mod(o).cmp(d);)r.iadd(l);if(b(p=r.shrn(1))&&b(r)&&y(p)&&y(r)&&a.test(p)&&a.test(r))return r}}},function(t,e,r){var n=r(2),i=r(59);function o(t){this.rand=t||new i.Rand}t.exports=o,o.create=function(t){return new o(t)},o.prototype._randbelow=function(t){var e=t.bitLength(),r=Math.ceil(e/8);do{var i=new n(this.rand.generate(r))}while(i.cmp(t)>=0);return i},o.prototype._randrange=function(t,e){var r=e.sub(t);return t.add(this._randbelow(r))},o.prototype.test=function(t,e,r){var i=t.bitLength(),o=n.mont(t),a=new n(1).toRed(o);e||(e=Math.max(1,i/48|0));for(var f=t.subn(1),s=0;!f.testn(s);s++);for(var c=t.shrn(s),u=f.toRed(o);e>0;e--){var h=this._randrange(new n(2),f);r&&r(h);var d=h.toRed(o).redPow(c);if(0!==d.cmp(a)&&0!==d.cmp(u)){for(var l=1;l<s;l++){if(0===(d=d.redSqr()).cmp(a))return!1;if(0===d.cmp(u))break}if(l===s)return!1}}return!0},o.prototype.getDivisor=function(t,e){var r=t.bitLength(),i=n.mont(t),o=new n(1).toRed(i);e||(e=Math.max(1,r/48|0));for(var a=t.subn(1),f=0;!a.testn(f);f++);for(var s=t.shrn(f),c=a.toRed(i);e>0;e--){var u=this._randrange(new n(2),a),h=t.gcd(u);if(0!==h.cmpn(1))return h;var d=u.toRed(i).redPow(s);if(0!==d.cmp(o)&&0!==d.cmp(c)){for(var l=1;l<f;l++){if(0===(d=d.redSqr()).cmp(o))return d.fromRed().subn(1).gcd(t);if(0===d.cmp(c))break}if(l===f)return(d=d.redSqr()).fromRed().subn(1).gcd(t)}}return!1}},function(t,e,r){var n;function i(t){this.rand=t}if(t.exports=function(t){return n||(n=new i(null)),n.generate(t)},t.exports.Rand=i,i.prototype.generate=function(t){return this._rand(t)},i.prototype._rand=function(t){if(this.rand.getBytes)return this.rand.getBytes(t);for(var e=new Uint8Array(t),r=0;r<e.length;r++)e[r]=this.rand.getByte();return e},"object"==typeof self)self.crypto&&self.crypto.getRandomValues?i.prototype._rand=function(t){var e=new Uint8Array(t);return self.crypto.getRandomValues(e),e}:self.msCrypto&&self.msCrypto.getRandomValues?i.prototype._rand=function(t){var e=new Uint8Array(t);return self.msCrypto.getRandomValues(e),e}:"object"==typeof window&&(i.prototype._rand=function(){throw new Error("Not implemented yet")});else try{var o=r(116);if("function"!=typeof o.randomBytes)throw new Error("Not supported");i.prototype._rand=function(t){return o.randomBytes(t)}}catch(t){}},function(t,e,r){"use strict";var n=e;function i(t){return 1===t.length?"0"+t:t}function o(t){for(var e="",r=0;r<t.length;r++)e+=i(t[r].toString(16));return e}n.toArray=function(t,e){if(Array.isArray(t))return t.slice();if(!t)return[];var r=[];if("string"!=typeof t){for(var n=0;n<t.length;n++)r[n]=0|t[n];return r}if("hex"===e)for((t=t.replace(/[^a-z0-9]+/gi,"")).length%2!=0&&(t="0"+t),n=0;n<t.length;n+=2)r.push(parseInt(t[n]+t[n+1],16));else for(n=0;n<t.length;n++){var i=t.charCodeAt(n),o=i>>8,a=255&i;o?r.push(o,a):r.push(a)}return r},n.zero2=i,n.toHex=o,n.encode=function(t,e){return"hex"===e?o(t):t}},function(t,e,r){"use strict";var n=r(6).rotr32;function i(t,e,r){return t&e^~t&r}function o(t,e,r){return t&e^t&r^e&r}function a(t,e,r){return t^e^r}e.ft_1=function(t,e,r,n){return 0===t?i(e,r,n):1===t||3===t?a(e,r,n):2===t?o(e,r,n):void 0},e.ch32=i,e.maj32=o,e.p32=a,e.s0_256=function(t){return n(t,2)^n(t,13)^n(t,22)},e.s1_256=function(t){return n(t,6)^n(t,11)^n(t,25)},e.g0_256=function(t){return n(t,7)^n(t,18)^t>>>3},e.g1_256=function(t){return n(t,17)^n(t,19)^t>>>10}},function(t,e,r){"use strict";var n=r(6),i=r(16),o=r(61),a=r(5),f=n.sum32,s=n.sum32_4,c=n.sum32_5,u=o.ch32,h=o.maj32,d=o.s0_256,l=o.s1_256,p=o.g0_256,b=o.g1_256,y=i.BlockHash,v=[1116352408,1899447441,3049323471,3921009573,961987163,1508970993,2453635748,2870763221,3624381080,310598401,607225278,1426881987,1925078388,2162078206,2614888103,3248222580,3835390401,4022224774,264347078,604807628,770255983,1249150122,1555081692,1996064986,2554220882,2821834349,2952996808,3210313671,3336571891,3584528711,113926993,338241895,666307205,773529912,1294757372,1396182291,1695183700,1986661051,2177026350,2456956037,2730485921,2820302411,3259730800,3345764771,3516065817,3600352804,4094571909,275423344,430227734,506948616,659060556,883997877,958139571,1322822218,1537002063,1747873779,1955562222,2024104815,2227730452,2361852424,2428436474,2756734187,3204031479,3329325298];function g(){if(!(this instanceof g))return new g;y.call(this),this.h=[1779033703,3144134277,1013904242,2773480762,1359893119,2600822924,528734635,1541459225],this.k=v,this.W=new Array(64)}n.inherits(g,y),t.exports=g,g.blockSize=512,g.outSize=256,g.hmacStrength=192,g.padLength=64,g.prototype._update=function(t,e){for(var r=this.W,n=0;n<16;n++)r[n]=t[e+n];for(;n<r.length;n++)r[n]=s(b(r[n-2]),r[n-7],p(r[n-15]),r[n-16]);var i=this.h[0],o=this.h[1],y=this.h[2],v=this.h[3],g=this.h[4],m=this.h[5],_=this.h[6],w=this.h[7];for(a(this.k.length===r.length),n=0;n<r.length;n++){var S=c(w,l(g),u(g,m,_),this.k[n],r[n]),E=f(d(i),h(i,o,y));w=_,_=m,m=g,g=f(v,S),v=y,y=o,o=i,i=f(S,E)}this.h[0]=f(this.h[0],i),this.h[1]=f(this.h[1],o),this.h[2]=f(this.h[2],y),this.h[3]=f(this.h[3],v),this.h[4]=f(this.h[4],g),this.h[5]=f(this.h[5],m),this.h[6]=f(this.h[6],_),this.h[7]=f(this.h[7],w)},g.prototype._digest=function(t){return"hex"===t?n.toHex32(this.h,"big"):n.split32(this.h,"big")}},function(t,e,r){"use strict";var n=r(6),i=r(16),o=r(5),a=n.rotr64_hi,f=n.rotr64_lo,s=n.shr64_hi,c=n.shr64_lo,u=n.sum64,h=n.sum64_hi,d=n.sum64_lo,l=n.sum64_4_hi,p=n.sum64_4_lo,b=n.sum64_5_hi,y=n.sum64_5_lo,v=i.BlockHash,g=[1116352408,3609767458,1899447441,602891725,3049323471,3964484399,3921009573,2173295548,961987163,4081628472,1508970993,3053834265,2453635748,2937671579,2870763221,3664609560,3624381080,2734883394,310598401,1164996542,607225278,1323610764,1426881987,3590304994,1925078388,4068182383,2162078206,991336113,2614888103,633803317,3248222580,3479774868,3835390401,2666613458,4022224774,944711139,264347078,2341262773,604807628,2007800933,770255983,1495990901,1249150122,1856431235,1555081692,3175218132,1996064986,2198950837,2554220882,3999719339,2821834349,766784016,2952996808,2566594879,3210313671,3203337956,3336571891,1034457026,3584528711,2466948901,113926993,3758326383,338241895,168717936,666307205,1188179964,773529912,1546045734,1294757372,1522805485,1396182291,2643833823,1695183700,2343527390,1986661051,1014477480,2177026350,1206759142,2456956037,344077627,2730485921,1290863460,2820302411,3158454273,3259730800,3505952657,3345764771,106217008,3516065817,3606008344,3600352804,1432725776,4094571909,1467031594,275423344,851169720,430227734,3100823752,506948616,1363258195,659060556,3750685593,883997877,3785050280,958139571,3318307427,1322822218,3812723403,1537002063,2003034995,1747873779,3602036899,1955562222,1575990012,2024104815,1125592928,2227730452,2716904306,2361852424,442776044,2428436474,593698344,2756734187,3733110249,3204031479,2999351573,3329325298,3815920427,3391569614,3928383900,3515267271,566280711,3940187606,3454069534,4118630271,4000239992,116418474,1914138554,174292421,2731055270,289380356,3203993006,460393269,320620315,685471733,587496836,852142971,1086792851,1017036298,365543100,1126000580,2618297676,1288033470,3409855158,1501505948,4234509866,1607167915,987167468,1816402316,1246189591];function m(){if(!(this instanceof m))return new m;v.call(this),this.h=[1779033703,4089235720,3144134277,2227873595,1013904242,4271175723,2773480762,1595750129,1359893119,2917565137,2600822924,725511199,528734635,4215389547,1541459225,327033209],this.k=g,this.W=new Array(160)}function _(t,e,r,n,i){var o=t&r^~t&i;return o<0&&(o+=4294967296),o}function w(t,e,r,n,i,o){var a=e&n^~e&o;return a<0&&(a+=4294967296),a}function S(t,e,r,n,i){var o=t&r^t&i^r&i;return o<0&&(o+=4294967296),o}function E(t,e,r,n,i,o){var a=e&n^e&o^n&o;return a<0&&(a+=4294967296),a}function M(t,e){var r=a(t,e,28)^a(e,t,2)^a(e,t,7);return r<0&&(r+=4294967296),r}function A(t,e){var r=f(t,e,28)^f(e,t,2)^f(e,t,7);return r<0&&(r+=4294967296),r}function x(t,e){var r=a(t,e,14)^a(t,e,18)^a(e,t,9);return r<0&&(r+=4294967296),r}function k(t,e){var r=f(t,e,14)^f(t,e,18)^f(e,t,9);return r<0&&(r+=4294967296),r}function I(t,e){var r=a(t,e,1)^a(t,e,8)^s(t,e,7);return r<0&&(r+=4294967296),r}function B(t,e){var r=f(t,e,1)^f(t,e,8)^c(t,e,7);return r<0&&(r+=4294967296),r}function R(t,e){var r=a(t,e,19)^a(e,t,29)^s(t,e,6);return r<0&&(r+=4294967296),r}function P(t,e){var r=f(t,e,19)^f(e,t,29)^c(t,e,6);return r<0&&(r+=4294967296),r}n.inherits(m,v),t.exports=m,m.blockSize=1024,m.outSize=512,m.hmacStrength=192,m.padLength=128,m.prototype._prepareBlock=function(t,e){for(var r=this.W,n=0;n<32;n++)r[n]=t[e+n];for(;n<r.length;n+=2){var i=R(r[n-4],r[n-3]),o=P(r[n-4],r[n-3]),a=r[n-14],f=r[n-13],s=I(r[n-30],r[n-29]),c=B(r[n-30],r[n-29]),u=r[n-32],h=r[n-31];r[n]=l(i,o,a,f,s,c,u,h),r[n+1]=p(i,o,a,f,s,c,u,h)}},m.prototype._update=function(t,e){this._prepareBlock(t,e);var r=this.W,n=this.h[0],i=this.h[1],a=this.h[2],f=this.h[3],s=this.h[4],c=this.h[5],l=this.h[6],p=this.h[7],v=this.h[8],g=this.h[9],m=this.h[10],I=this.h[11],B=this.h[12],R=this.h[13],P=this.h[14],T=this.h[15];o(this.k.length===r.length);for(var L=0;L<r.length;L+=2){var O=P,C=T,j=x(v,g),N=k(v,g),D=_(v,0,m,0,B),U=w(0,g,0,I,0,R),q=this.k[L],z=this.k[L+1],F=r[L],K=r[L+1],Y=b(O,C,j,N,D,U,q,z,F,K),V=y(O,C,j,N,D,U,q,z,F,K);O=M(n,i),C=A(n,i),j=S(n,0,a,0,s),N=E(0,i,0,f,0,c);var H=h(O,C,j,N),W=d(O,C,j,N);P=B,T=R,B=m,R=I,m=v,I=g,v=h(l,p,Y,V),g=d(p,p,Y,V),l=s,p=c,s=a,c=f,a=n,f=i,n=h(Y,V,H,W),i=d(Y,V,H,W)}u(this.h,0,n,i),u(this.h,2,a,f),u(this.h,4,s,c),u(this.h,6,l,p),u(this.h,8,v,g),u(this.h,10,m,I),u(this.h,12,B,R),u(this.h,14,P,T)},m.prototype._digest=function(t){return"hex"===t?n.toHex32(this.h,"big"):n.split32(this.h,"big")}},function(t,e,r){var n=r(0),i=r(18).Reporter,o=r(3).Buffer;function a(t,e){i.call(this,e),o.isBuffer(t)?(this.base=t,this.offset=0,this.length=t.length):this.error("Input not Buffer")}function f(t,e){if(Array.isArray(t))this.length=0,this.value=t.map(function(t){return t instanceof f||(t=new f(t,e)),this.length+=t.length,t},this);else if("number"==typeof t){if(!(0<=t&&t<=255))return e.error("non-byte EncoderBuffer value");this.value=t,this.length=1}else if("string"==typeof t)this.value=t,this.length=o.byteLength(t);else{if(!o.isBuffer(t))return e.error("Unsupported type: "+typeof t);this.value=t,this.length=t.length}}n(a,i),e.DecoderBuffer=a,a.prototype.save=function(){return{offset:this.offset,reporter:i.prototype.save.call(this)}},a.prototype.restore=function(t){var e=new a(this.base);return e.offset=t.offset,e.length=this.offset,this.offset=t.offset,i.prototype.restore.call(this,t.reporter),e},a.prototype.isEmpty=function(){return this.offset===this.length},a.prototype.readUInt8=function(t){return this.offset+1<=this.length?this.base.readUInt8(this.offset++,!0):this.error(t||"DecoderBuffer overrun")},a.prototype.skip=function(t,e){if(!(this.offset+t<=this.length))return this.error(e||"DecoderBuffer overrun");var r=new a(this.base);return r._reporterState=this._reporterState,r.offset=this.offset,r.length=this.offset+t,this.offset+=t,r},a.prototype.raw=function(t){return this.base.slice(t?t.offset:this.offset,this.length)},e.EncoderBuffer=f,f.prototype.join=function(t,e){return t||(t=new o(this.length)),e||(e=0),0===this.length?t:(Array.isArray(this.value)?this.value.forEach(function(r){r.join(t,e),e+=r.length}):("number"==typeof this.value?t[e]=this.value:"string"==typeof this.value?t.write(this.value,e):o.isBuffer(this.value)&&this.value.copy(t,e),e+=this.length),t)}},function(t,e,r){var n=e;n._reverse=function(t){var e={};return Object.keys(t).forEach(function(r){(0|r)==r&&(r|=0);var n=t[r];e[n]=r}),e},n.der=r(148)},function(t,e,r){var n=r(0),i=r(17),o=i.base,a=i.bignum,f=i.constants.der;function s(t){this.enc="der",this.name=t.name,this.entity=t,this.tree=new c,this.tree._init(t.body)}function c(t){o.Node.call(this,"der",t)}function u(t,e){var r=t.readUInt8(e);if(t.isError(r))return r;var n=f.tagClass[r>>6],i=0==(32&r);if(31==(31&r)){var o=r;for(r=0;128==(128&o);){if(o=t.readUInt8(e),t.isError(o))return o;r<<=7,r|=127&o}}else r&=31;return{cls:n,primitive:i,tag:r,tagStr:f.tag[r]}}function h(t,e,r){var n=t.readUInt8(r);if(t.isError(n))return n;if(!e&&128===n)return null;if(0==(128&n))return n;var i=127&n;if(i>4)return t.error("length octect is too long");n=0;for(var o=0;o<i;o++){n<<=8;var a=t.readUInt8(r);if(t.isError(a))return a;n|=a}return n}t.exports=s,s.prototype.decode=function(t,e){return t instanceof o.DecoderBuffer||(t=new o.DecoderBuffer(t,e)),this.tree._decode(t,e)},n(c,o.Node),c.prototype._peekTag=function(t,e,r){if(t.isEmpty())return!1;var n=t.save(),i=u(t,'Failed to peek tag: "'+e+'"');return t.isError(i)?i:(t.restore(n),i.tag===e||i.tagStr===e||i.tagStr+"of"===e||r)},c.prototype._decodeTag=function(t,e,r){var n=u(t,'Failed to decode tag of "'+e+'"');if(t.isError(n))return n;var i=h(t,n.primitive,'Failed to get length of "'+e+'"');if(t.isError(i))return i;if(!r&&n.tag!==e&&n.tagStr!==e&&n.tagStr+"of"!==e)return t.error('Failed to match tag: "'+e+'"');if(n.primitive||null!==i)return t.skip(i,'Failed to match body of: "'+e+'"');var o=t.save(),a=this._skipUntilEnd(t,'Failed to skip indefinite length body: "'+this.tag+'"');return t.isError(a)?a:(i=t.offset-o.offset,t.restore(o),t.skip(i,'Failed to match body of: "'+e+'"'))},c.prototype._skipUntilEnd=function(t,e){for(;;){var r=u(t,e);if(t.isError(r))return r;var n,i=h(t,r.primitive,e);if(t.isError(i))return i;if(n=r.primitive||null!==i?t.skip(i):this._skipUntilEnd(t,e),t.isError(n))return n;if("end"===r.tagStr)break}},c.prototype._decodeList=function(t,e,r,n){for(var i=[];!t.isEmpty();){var o=this._peekTag(t,"end");if(t.isError(o))return o;var a=r.decode(t,"der",n);if(t.isError(a)&&o)break;i.push(a)}return i},c.prototype._decodeStr=function(t,e){if("bitstr"===e){var r=t.readUInt8();return t.isError(r)?r:{unused:r,data:t.raw()}}if("bmpstr"===e){var n=t.raw();if(n.length%2==1)return t.error("Decoding of string type: bmpstr length mismatch");for(var i="",o=0;o<n.length/2;o++)i+=String.fromCharCode(n.readUInt16BE(2*o));return i}if("numstr"===e){var a=t.raw().toString("ascii");return this._isNumstr(a)?a:t.error("Decoding of string type: numstr unsupported characters")}if("octstr"===e)return t.raw();if("objDesc"===e)return t.raw();if("printstr"===e){var f=t.raw().toString("ascii");return this._isPrintstr(f)?f:t.error("Decoding of string type: printstr unsupported characters")}return/str$/.test(e)?t.raw().toString():t.error("Decoding of string type: "+e+" unsupported")},c.prototype._decodeObjid=function(t,e,r){for(var n,i=[],o=0;!t.isEmpty();){var a=t.readUInt8();o<<=7,o|=127&a,0==(128&a)&&(i.push(o),o=0)}128&a&&i.push(o);var f=i[0]/40|0,s=i[0]%40;if(n=r?i:[f,s].concat(i.slice(1)),e){var c=e[n.join(" ")];void 0===c&&(c=e[n.join(".")]),void 0!==c&&(n=c)}return n},c.prototype._decodeTime=function(t,e){var r=t.raw().toString();if("gentime"===e)var n=0|r.slice(0,4),i=0|r.slice(4,6),o=0|r.slice(6,8),a=0|r.slice(8,10),f=0|r.slice(10,12),s=0|r.slice(12,14);else{if("utctime"!==e)return t.error("Decoding "+e+" time is not supported yet");n=0|r.slice(0,2),i=0|r.slice(2,4),o=0|r.slice(4,6),a=0|r.slice(6,8),f=0|r.slice(8,10),s=0|r.slice(10,12),n=n<70?2e3+n:1900+n}return Date.UTC(n,i-1,o,a,f,s,0)},c.prototype._decodeNull=function(t){return null},c.prototype._decodeBool=function(t){var e=t.readUInt8();return t.isError(e)?e:0!==e},c.prototype._decodeInt=function(t,e){var r=t.raw(),n=new a(r);return e&&(n=e[n.toString(10)]||n),n},c.prototype._use=function(t,e){return"function"==typeof t&&(t=t(e)),t._getDecoder("der").tree}},function(t,e,r){var n=r(0),i=r(3).Buffer,o=r(17),a=o.base,f=o.constants.der;function s(t){this.enc="der",this.name=t.name,this.entity=t,this.tree=new c,this.tree._init(t.body)}function c(t){a.Node.call(this,"der",t)}function u(t){return t<10?"0"+t:t}t.exports=s,s.prototype.encode=function(t,e){return this.tree._encode(t,e).join()},n(c,a.Node),c.prototype._encodeComposite=function(t,e,r,n){var o,a=function(t,e,r,n){var i;if("seqof"===t?t="seq":"setof"===t&&(t="set"),f.tagByName.hasOwnProperty(t))i=f.tagByName[t];else{if("number"!=typeof t||(0|t)!==t)return n.error("Unknown tag: "+t);i=t}return i>=31?n.error("Multi-octet tag encoding unsupported"):(e||(i|=32),i|f.tagClassByName[r||"universal"]<<6)}(t,e,r,this.reporter);if(n.length<128)return(o=new i(2))[0]=a,o[1]=n.length,this._createEncoderBuffer([o,n]);for(var s=1,c=n.length;c>=256;c>>=8)s++;(o=new i(2+s))[0]=a,o[1]=128|s,c=1+s;for(var u=n.length;u>0;c--,u>>=8)o[c]=255&u;return this._createEncoderBuffer([o,n])},c.prototype._encodeStr=function(t,e){if("bitstr"===e)return this._createEncoderBuffer([0|t.unused,t.data]);if("bmpstr"===e){for(var r=new i(2*t.length),n=0;n<t.length;n++)r.writeUInt16BE(t.charCodeAt(n),2*n);return this._createEncoderBuffer(r)}return"numstr"===e?this._isNumstr(t)?this._createEncoderBuffer(t):this.reporter.error("Encoding of string type: numstr supports only digits and space"):"printstr"===e?this._isPrintstr(t)?this._createEncoderBuffer(t):this.reporter.error("Encoding of string type: printstr supports only latin upper and lower case letters, digits, space, apostrophe, left and rigth parenthesis, plus sign, comma, hyphen, dot, slash, colon, equal sign, question mark"):/str$/.test(e)?this._createEncoderBuffer(t):"objDesc"===e?this._createEncoderBuffer(t):this.reporter.error("Encoding of string type: "+e+" unsupported")},c.prototype._encodeObjid=function(t,e,r){if("string"==typeof t){if(!e)return this.reporter.error("string objid given, but no values map found");if(!e.hasOwnProperty(t))return this.reporter.error("objid not found in values map");t=e[t].split(/[\s\.]+/g);for(var n=0;n<t.length;n++)t[n]|=0}else if(Array.isArray(t))for(t=t.slice(),n=0;n<t.length;n++)t[n]|=0;if(!Array.isArray(t))return this.reporter.error("objid() should be either array or string, got: "+JSON.stringify(t));if(!r){if(t[1]>=40)return this.reporter.error("Second objid identifier OOB");t.splice(0,2,40*t[0]+t[1])}var o=0;for(n=0;n<t.length;n++){var a=t[n];for(o++;a>=128;a>>=7)o++}var f=new i(o),s=f.length-1;for(n=t.length-1;n>=0;n--)for(a=t[n],f[s--]=127&a;(a>>=7)>0;)f[s--]=128|127&a;return this._createEncoderBuffer(f)},c.prototype._encodeTime=function(t,e){var r,n=new Date(t);return"gentime"===e?r=[u(n.getFullYear()),u(n.getUTCMonth()+1),u(n.getUTCDate()),u(n.getUTCHours()),u(n.getUTCMinutes()),u(n.getUTCSeconds()),"Z"].join(""):"utctime"===e?r=[u(n.getFullYear()%100),u(n.getUTCMonth()+1),u(n.getUTCDate()),u(n.getUTCHours()),u(n.getUTCMinutes()),u(n.getUTCSeconds()),"Z"].join(""):this.reporter.error("Encoding "+e+" time is not supported yet"),this._encodeStr(r,"octstr")},c.prototype._encodeNull=function(){return this._createEncoderBuffer("")},c.prototype._encodeInt=function(t,e){if("string"==typeof t){if(!e)return this.reporter.error("String int or enum given, but no values map");if(!e.hasOwnProperty(t))return this.reporter.error("Values map doesn't contain: "+JSON.stringify(t));t=e[t]}if("number"!=typeof t&&!i.isBuffer(t)){var r=t.toArray();!t.sign&&128&r[0]&&r.unshift(0),t=new i(r)}if(i.isBuffer(t)){var n=t.length;0===t.length&&n++;var o=new i(n);return t.copy(o),0===t.length&&(o[0]=0),this._createEncoderBuffer(o)}if(t<128)return this._createEncoderBuffer(t);if(t<256)return this._createEncoderBuffer([0,t]);n=1;for(var a=t;a>=256;a>>=8)n++;for(a=(o=new Array(n)).length-1;a>=0;a--)o[a]=255&t,t>>=8;return 128&o[0]&&o.unshift(0),this._createEncoderBuffer(new i(o))},c.prototype._encodeBool=function(t){return this._createEncoderBuffer(t?255:0)},c.prototype._use=function(t,e){return"function"==typeof t&&(t=t(e)),t._getEncoder("der").tree},c.prototype._skipDefault=function(t,e,r){var n,i=this._baseState;if(null===i.default)return!1;var o=t.join();if(void 0===i.defaultBuffer&&(i.defaultBuffer=this._encodeValue(i.default,e,r).join()),o.length!==i.defaultBuffer.length)return!1;for(n=0;n<o.length;n++)if(o[n]!==i.defaultBuffer[n])return!1;return!0}},function(t){t.exports={"1.3.132.0.10":"secp256k1","1.3.132.0.33":"p224","1.2.840.10045.3.1.1":"p192","1.2.840.10045.3.1.7":"p256","1.3.132.0.34":"p384","1.3.132.0.35":"p521"}},function(t,e,r){var n=r(13),i=r(1).Buffer;function o(t){var e=i.allocUnsafe(4);return e.writeUInt32BE(t,0),e}t.exports=function(t,e){for(var r,a=i.alloc(0),f=0;a.length<e;)r=o(f++),a=i.concat([a,n("sha1").update(t).update(r).digest()]);return a.slice(0,e)}},function(t,e){t.exports=function(t,e){for(var r=t.length,n=-1;++n<r;)t[n]^=e[n];return t}},function(t,e,r){var n=r(2),i=r(1).Buffer;t.exports=function(t,e){return i.from(t.toRed(n.mont(e.modulus)).redPow(new n(e.publicExponent)).fromRed().toArray())}},function(t,e,r){t.exports=function(t){var e={};function r(n){if(e[n])return e[n].exports;var i=e[n]={i:n,l:!1,exports:{}};return t[n].call(i.exports,i,i.exports,r),i.l=!0,i.exports}return r.m=t,r.c=e,r.d=function(t,e,n){r.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:n})},r.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},r.t=function(t,e){if(1&e&&(t=r(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var n=Object.create(null);if(r.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var i in t)r.d(n,i,function(e){return t[e]}.bind(null,i));return n},r.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return r.d(e,"a",e),e},r.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},r.p="",r(r.s=115)}([function(t,e,r){var n=r(2),i=r(8),o=r(13),a=r(10),f=r(20),s=function(t,e,r){var c,u,h,d,l=t&s.F,p=t&s.G,b=t&s.S,y=t&s.P,v=t&s.B,g=p?n:b?n[e]||(n[e]={}):(n[e]||{}).prototype,m=p?i:i[e]||(i[e]={}),_=m.prototype||(m.prototype={});for(c in p&&(r=e),r)h=((u=!l&&g&&void 0!==g[c])?g:r)[c],d=v&&u?f(h,n):y&&"function"==typeof h?f(Function.call,h):h,g&&a(g,c,h,t&s.U),m[c]!=h&&o(m,c,d),y&&_[c]!=h&&(_[c]=h)};n.core=i,s.F=1,s.G=2,s.S=4,s.P=8,s.B=16,s.W=32,s.U=64,s.R=128,t.exports=s},function(t,e){t.exports=function(t){try{return!!t()}catch(t){return!0}}},function(t,e){var r=t.exports="undefined"!=typeof window&&window.Math==Math?window:"undefined"!=typeof self&&self.Math==Math?self:Function("return this")();"number"==typeof __g&&(__g=r)},function(t,e){t.exports=function(t){return"object"==typeof t?null!==t:"function"==typeof t}},function(t,e,r){var n=r(3);t.exports=function(t){if(!n(t))throw TypeError(t+" is not an object!");return t}},function(t,e,r){var n=r(59)("wks"),i=r(29),o=r(2).Symbol,a="function"==typeof o;(t.exports=function(t){return n[t]||(n[t]=a&&o[t]||(a?o:i)("Symbol."+t))}).store=n},function(t,e,r){var n=r(4),i=r(85),o=r(26),a=Object.defineProperty;e.f=r(7)?Object.defineProperty:function(t,e,r){if(n(t),e=o(e,!0),n(r),i)try{return a(t,e,r)}catch(t){}if("get"in r||"set"in r)throw TypeError("Accessors not supported!");return"value"in r&&(t[e]=r.value),t}},function(t,e,r){t.exports=!r(1)(function(){return 7!=Object.defineProperty({},"a",{get:function(){return 7}}).a})},function(t,e){var r=t.exports={version:"2.5.7"};"number"==typeof __e&&(__e=r)},function(t,e,r){var n=r(24),i=Math.min;t.exports=function(t){return t>0?i(n(t),9007199254740991):0}},function(t,e,r){var n=r(2),i=r(13),o=r(12),a=r(29)("src"),f=Function.toString,s=(""+f).split("toString");r(8).inspectSource=function(t){return f.call(t)},(t.exports=function(t,e,r,f){var c="function"==typeof r;c&&(o(r,"name")||i(r,"name",e)),t[e]!==r&&(c&&(o(r,a)||i(r,a,t[e]?""+t[e]:s.join(String(e)))),t===n?t[e]=r:f?t[e]?t[e]=r:i(t,e,r):(delete t[e],i(t,e,r)))})(Function.prototype,"toString",function(){return"function"==typeof this&&this[a]||f.call(this)})},function(t,e,r){var n=r(0),i=r(1),o=r(23),a=/"/g,f=function(t,e,r,n){var i=String(o(t)),f="<"+e;return""!==r&&(f+=" "+r+'="'+String(n).replace(a,"&quot;")+'"'),f+">"+i+"</"+e+">"};t.exports=function(t,e){var r={};r[t]=e(f),n(n.P+n.F*i(function(){var e=""[t]('"');return e!==e.toLowerCase()||e.split('"').length>3}),"String",r)}},function(t,e){var r={}.hasOwnProperty;t.exports=function(t,e){return r.call(t,e)}},function(t,e,r){var n=r(6),i=r(28);t.exports=r(7)?function(t,e,r){return n.f(t,e,i(1,r))}:function(t,e,r){return t[e]=r,t}},function(t,e,r){var n=r(44),i=r(23);t.exports=function(t){return n(i(t))}},function(t,e,r){var n=r(23);t.exports=function(t){return Object(n(t))}},function(t,e,r){"use strict";var n=r(1);t.exports=function(t,e){return!!t&&n(function(){e?t.call(null,function(){},1):t.call(null)})}},function(t,e,r){var n=r(45),i=r(28),o=r(14),a=r(26),f=r(12),s=r(85),c=Object.getOwnPropertyDescriptor;e.f=r(7)?c:function(t,e){if(t=o(t),e=a(e,!0),s)try{return c(t,e)}catch(t){}if(f(t,e))return i(!n.f.call(t,e),t[e])}},function(t,e,r){var n=r(0),i=r(8),o=r(1);t.exports=function(t,e){var r=(i.Object||{})[t]||Object[t],a={};a[t]=e(r),n(n.S+n.F*o(function(){r(1)}),"Object",a)}},function(t,e,r){var n=r(20),i=r(44),o=r(15),a=r(9),f=r(209);t.exports=function(t,e){var r=1==t,s=2==t,c=3==t,u=4==t,h=6==t,d=5==t||h,l=e||f;return function(e,f,p){for(var b,y,v=o(e),g=i(v),m=n(f,p,3),_=a(g.length),w=0,S=r?l(e,_):s?l(e,0):void 0;_>w;w++)if((d||w in g)&&(y=m(b=g[w],w,v),t))if(r)S[w]=y;else if(y)switch(t){case 3:return!0;case 5:return b;case 6:return w;case 2:S.push(b)}else if(u)return!1;return h?-1:c||u?u:S}}},function(t,e,r){var n=r(21);t.exports=function(t,e,r){if(n(t),void 0===e)return t;switch(r){case 1:return function(r){return t.call(e,r)};case 2:return function(r,n){return t.call(e,r,n)};case 3:return function(r,n,i){return t.call(e,r,n,i)}}return function(){return t.apply(e,arguments)}}},function(t,e){t.exports=function(t){if("function"!=typeof t)throw TypeError(t+" is not a function!");return t}},function(t,e){var r={}.toString;t.exports=function(t){return r.call(t).slice(8,-1)}},function(t,e){t.exports=function(t){if(void 0==t)throw TypeError("Can't call method on  "+t);return t}},function(t,e){var r=Math.ceil,n=Math.floor;t.exports=function(t){return isNaN(t=+t)?0:(t>0?n:r)(t)}},function(t,e,r){"use strict";if(r(7)){var n=r(30),i=r(2),o=r(1),a=r(0),f=r(56),s=r(82),c=r(20),u=r(40),h=r(28),d=r(13),l=r(41),p=r(24),b=r(9),y=r(110),v=r(32),g=r(26),m=r(12),_=r(48),w=r(3),S=r(15),E=r(75),M=r(33),A=r(35),x=r(34).f,k=r(77),I=r(29),B=r(5),R=r(19),P=r(46),T=r(53),L=r(79),O=r(37),C=r(50),j=r(39),N=r(78),D=r(102),U=r(6),q=r(17),z=U.f,F=q.f,K=i.RangeError,Y=i.TypeError,V=i.Uint8Array,H=Array.prototype,W=s.ArrayBuffer,G=s.DataView,X=R(0),J=R(2),Z=R(3),$=R(4),Q=R(5),tt=R(6),et=P(!0),rt=P(!1),nt=L.values,it=L.keys,ot=L.entries,at=H.lastIndexOf,ft=H.reduce,st=H.reduceRight,ct=H.join,ut=H.sort,ht=H.slice,dt=H.toString,lt=H.toLocaleString,pt=B("iterator"),bt=B("toStringTag"),yt=I("typed_constructor"),vt=I("def_constructor"),gt=f.CONSTR,mt=f.TYPED,_t=f.VIEW,wt=R(1,function(t,e){return xt(T(t,t[vt]),e)}),St=o(function(){return 1===new V(new Uint16Array([1]).buffer)[0]}),Et=!!V&&!!V.prototype.set&&o(function(){new V(1).set({})}),Mt=function(t,e){var r=p(t);if(r<0||r%e)throw K("Wrong offset!");return r},At=function(t){if(w(t)&&mt in t)return t;throw Y(t+" is not a typed array!")},xt=function(t,e){if(!(w(t)&&yt in t))throw Y("It is not a typed array constructor!");return new t(e)},kt=function(t,e){return It(T(t,t[vt]),e)},It=function(t,e){for(var r=0,n=e.length,i=xt(t,n);n>r;)i[r]=e[r++];return i},Bt=function(t,e,r){z(t,e,{get:function(){return this._d[r]}})},Rt=function(t){var e,r,n,i,o,a,f=S(t),s=arguments.length,u=s>1?arguments[1]:void 0,h=void 0!==u,d=k(f);if(void 0!=d&&!E(d)){for(a=d.call(f),n=[],e=0;!(o=a.next()).done;e++)n.push(o.value);f=n}for(h&&s>2&&(u=c(u,arguments[2],2)),e=0,r=b(f.length),i=xt(this,r);r>e;e++)i[e]=h?u(f[e],e):f[e];return i},Pt=function(){for(var t=0,e=arguments.length,r=xt(this,e);e>t;)r[t]=arguments[t++];return r},Tt=!!V&&o(function(){lt.call(new V(1))}),Lt=function(){return lt.apply(Tt?ht.call(At(this)):At(this),arguments)},Ot={copyWithin:function(t,e){return D.call(At(this),t,e,arguments.length>2?arguments[2]:void 0)},every:function(t){return $(At(this),t,arguments.length>1?arguments[1]:void 0)},fill:function(t){return N.apply(At(this),arguments)},filter:function(t){return kt(this,J(At(this),t,arguments.length>1?arguments[1]:void 0))},find:function(t){return Q(At(this),t,arguments.length>1?arguments[1]:void 0)},findIndex:function(t){return tt(At(this),t,arguments.length>1?arguments[1]:void 0)},forEach:function(t){X(At(this),t,arguments.length>1?arguments[1]:void 0)},indexOf:function(t){return rt(At(this),t,arguments.length>1?arguments[1]:void 0)},includes:function(t){return et(At(this),t,arguments.length>1?arguments[1]:void 0)},join:function(t){return ct.apply(At(this),arguments)},lastIndexOf:function(t){return at.apply(At(this),arguments)},map:function(t){return wt(At(this),t,arguments.length>1?arguments[1]:void 0)},reduce:function(t){return ft.apply(At(this),arguments)},reduceRight:function(t){return st.apply(At(this),arguments)},reverse:function(){for(var t,e=At(this).length,r=Math.floor(e/2),n=0;n<r;)t=this[n],this[n++]=this[--e],this[e]=t;return this},some:function(t){return Z(At(this),t,arguments.length>1?arguments[1]:void 0)},sort:function(t){return ut.call(At(this),t)},subarray:function(t,e){var r=At(this),n=r.length,i=v(t,n);return new(T(r,r[vt]))(r.buffer,r.byteOffset+i*r.BYTES_PER_ELEMENT,b((void 0===e?n:v(e,n))-i))}},Ct=function(t,e){return kt(this,ht.call(At(this),t,e))},jt=function(t){At(this);var e=Mt(arguments[1],1),r=this.length,n=S(t),i=b(n.length),o=0;if(i+e>r)throw K("Wrong length!");for(;o<i;)this[e+o]=n[o++]},Nt={entries:function(){return ot.call(At(this))},keys:function(){return it.call(At(this))},values:function(){return nt.call(At(this))}},Dt=function(t,e){return w(t)&&t[mt]&&"symbol"!=typeof e&&e in t&&String(+e)==String(e)},Ut=function(t,e){return Dt(t,e=g(e,!0))?h(2,t[e]):F(t,e)},qt=function(t,e,r){return!(Dt(t,e=g(e,!0))&&w(r)&&m(r,"value"))||m(r,"get")||m(r,"set")||r.configurable||m(r,"writable")&&!r.writable||m(r,"enumerable")&&!r.enumerable?z(t,e,r):(t[e]=r.value,t)};gt||(q.f=Ut,U.f=qt),a(a.S+a.F*!gt,"Object",{getOwnPropertyDescriptor:Ut,defineProperty:qt}),o(function(){dt.call({})})&&(dt=lt=function(){return ct.call(this)});var zt=l({},Ot);l(zt,Nt),d(zt,pt,Nt.values),l(zt,{slice:Ct,set:jt,constructor:function(){},toString:dt,toLocaleString:Lt}),Bt(zt,"buffer","b"),Bt(zt,"byteOffset","o"),Bt(zt,"byteLength","l"),Bt(zt,"length","e"),z(zt,bt,{get:function(){return this[mt]}}),t.exports=function(t,e,r,s){var c=t+((s=!!s)?"Clamped":"")+"Array",h="get"+t,l="set"+t,p=i[c],v=p||{},g=p&&A(p),m=!p||!f.ABV,S={},E=p&&p.prototype,k=function(t,r){z(t,r,{get:function(){return function(t,r){var n=t._d;return n.v[h](r*e+n.o,St)}(this,r)},set:function(t){return function(t,r,n){var i=t._d;s&&(n=(n=Math.round(n))<0?0:n>255?255:255&n),i.v[l](r*e+i.o,n,St)}(this,r,t)},enumerable:!0})};m?(p=r(function(t,r,n,i){u(t,p,c,"_d");var o,a,f,s,h=0,l=0;if(w(r)){if(!(r instanceof W||"ArrayBuffer"==(s=_(r))||"SharedArrayBuffer"==s))return mt in r?It(p,r):Rt.call(p,r);o=r,l=Mt(n,e);var v=r.byteLength;if(void 0===i){if(v%e)throw K("Wrong length!");if((a=v-l)<0)throw K("Wrong length!")}else if((a=b(i)*e)+l>v)throw K("Wrong length!");f=a/e}else f=y(r),o=new W(a=f*e);for(d(t,"_d",{b:o,o:l,l:a,e:f,v:new G(o)});h<f;)k(t,h++)}),E=p.prototype=M(zt),d(E,"constructor",p)):o(function(){p(1)})&&o(function(){new p(-1)})&&C(function(t){new p,new p(null),new p(1.5),new p(t)},!0)||(p=r(function(t,r,n,i){var o;return u(t,p,c),w(r)?r instanceof W||"ArrayBuffer"==(o=_(r))||"SharedArrayBuffer"==o?void 0!==i?new v(r,Mt(n,e),i):void 0!==n?new v(r,Mt(n,e)):new v(r):mt in r?It(p,r):Rt.call(p,r):new v(y(r))}),X(g!==Function.prototype?x(v).concat(x(g)):x(v),function(t){t in p||d(p,t,v[t])}),p.prototype=E,n||(E.constructor=p));var I=E[pt],B=!!I&&("values"==I.name||void 0==I.name),R=Nt.values;d(p,yt,!0),d(E,mt,c),d(E,_t,!0),d(E,vt,p),(s?new p(1)[bt]==c:bt in E)||z(E,bt,{get:function(){return c}}),S[c]=p,a(a.G+a.W+a.F*(p!=v),S),a(a.S,c,{BYTES_PER_ELEMENT:e}),a(a.S+a.F*o(function(){v.of.call(p,1)}),c,{from:Rt,of:Pt}),"BYTES_PER_ELEMENT"in E||d(E,"BYTES_PER_ELEMENT",e),a(a.P,c,Ot),j(c),a(a.P+a.F*Et,c,{set:jt}),a(a.P+a.F*!B,c,Nt),n||E.toString==dt||(E.toString=dt),a(a.P+a.F*o(function(){new p(1).slice()}),c,{slice:Ct}),a(a.P+a.F*(o(function(){return[1,2].toLocaleString()!=new p([1,2]).toLocaleString()})||!o(function(){E.toLocaleString.call([1,2])})),c,{toLocaleString:Lt}),O[c]=B?I:R,n||B||d(E,pt,R)}}else t.exports=function(){}},function(t,e,r){var n=r(3);t.exports=function(t,e){if(!n(t))return t;var r,i;if(e&&"function"==typeof(r=t.toString)&&!n(i=r.call(t)))return i;if("function"==typeof(r=t.valueOf)&&!n(i=r.call(t)))return i;if(!e&&"function"==typeof(r=t.toString)&&!n(i=r.call(t)))return i;throw TypeError("Can't convert object to primitive value")}},function(t,e,r){var n=r(29)("meta"),i=r(3),o=r(12),a=r(6).f,f=0,s=Object.isExtensible||function(){return!0},c=!r(1)(function(){return s(Object.preventExtensions({}))}),u=function(t){a(t,n,{value:{i:"O"+ ++f,w:{}}})},h=t.exports={KEY:n,NEED:!1,fastKey:function(t,e){if(!i(t))return"symbol"==typeof t?t:("string"==typeof t?"S":"P")+t;if(!o(t,n)){if(!s(t))return"F";if(!e)return"E";u(t)}return t[n].i},getWeak:function(t,e){if(!o(t,n)){if(!s(t))return!0;if(!e)return!1;u(t)}return t[n].w},onFreeze:function(t){return c&&h.NEED&&s(t)&&!o(t,n)&&u(t),t}}},function(t,e){t.exports=function(t,e){return{enumerable:!(1&t),configurable:!(2&t),writable:!(4&t),value:e}}},function(t,e){var r=0,n=Math.random();t.exports=function(t){return"Symbol(".concat(void 0===t?"":t,")_",(++r+n).toString(36))}},function(t,e){t.exports=!1},function(t,e,r){var n=r(87),i=r(62);t.exports=Object.keys||function(t){return n(t,i)}},function(t,e,r){var n=r(24),i=Math.max,o=Math.min;t.exports=function(t,e){return(t=n(t))<0?i(t+e,0):o(t,e)}},function(t,e,r){var n=r(4),i=r(88),o=r(62),a=r(61)("IE_PROTO"),f=function(){},s=function(){var t,e=r(58)("iframe"),n=o.length;for(e.style.display="none",r(64).appendChild(e),e.src="javascript:",(t=e.contentWindow.document).open(),t.write("<script>document.F=Object<\/script>"),t.close(),s=t.F;n--;)delete s.prototype[o[n]];return s()};t.exports=Object.create||function(t,e){var r;return null!==t?(f.prototype=n(t),r=new f,f.prototype=null,r[a]=t):r=s(),void 0===e?r:i(r,e)}},function(t,e,r){var n=r(87),i=r(62).concat("length","prototype");e.f=Object.getOwnPropertyNames||function(t){return n(t,i)}},function(t,e,r){var n=r(12),i=r(15),o=r(61)("IE_PROTO"),a=Object.prototype;t.exports=Object.getPrototypeOf||function(t){return t=i(t),n(t,o)?t[o]:"function"==typeof t.constructor&&t instanceof t.constructor?t.constructor.prototype:t instanceof Object?a:null}},function(t,e,r){var n=r(6).f,i=r(12),o=r(5)("toStringTag");t.exports=function(t,e,r){t&&!i(t=r?t:t.prototype,o)&&n(t,o,{configurable:!0,value:e})}},function(t,e){t.exports={}},function(t,e,r){var n=r(5)("unscopables"),i=Array.prototype;void 0==i[n]&&r(13)(i,n,{}),t.exports=function(t){i[n][t]=!0}},function(t,e,r){"use strict";var n=r(2),i=r(6),o=r(7),a=r(5)("species");t.exports=function(t){var e=n[t];o&&e&&!e[a]&&i.f(e,a,{configurable:!0,get:function(){return this}})}},function(t,e){t.exports=function(t,e,r,n){if(!(t instanceof e)||void 0!==n&&n in t)throw TypeError(r+": incorrect invocation!");return t}},function(t,e,r){var n=r(10);t.exports=function(t,e,r){for(var i in e)n(t,i,e[i],r);return t}},function(t,e,r){var n=r(3);t.exports=function(t,e){if(!n(t)||t._t!==e)throw TypeError("Incompatible receiver, "+e+" required!");return t}},function(t,e){t.exports=r(75)},function(t,e,r){var n=r(22);t.exports=Object("z").propertyIsEnumerable(0)?Object:function(t){return"String"==n(t)?t.split(""):Object(t)}},function(t,e){e.f={}.propertyIsEnumerable},function(t,e,r){var n=r(14),i=r(9),o=r(32);t.exports=function(t){return function(e,r,a){var f,s=n(e),c=i(s.length),u=o(a,c);if(t&&r!=r){for(;c>u;)if((f=s[u++])!=f)return!0}else for(;c>u;u++)if((t||u in s)&&s[u]===r)return t||u||0;return!t&&-1}}},function(t,e){e.f=Object.getOwnPropertySymbols},function(t,e,r){var n=r(22),i=r(5)("toStringTag"),o="Arguments"==n(function(){return arguments}());t.exports=function(t){var e,r,a;return void 0===t?"Undefined":null===t?"Null":"string"==typeof(r=function(t,e){try{return t[e]}catch(t){}}(e=Object(t),i))?r:o?n(e):"Object"==(a=n(e))&&"function"==typeof e.callee?"Arguments":a}},function(t,e,r){var n=r(0),i=r(23),o=r(1),a=r(66),f="["+a+"]",s=RegExp("^"+f+f+"*"),c=RegExp(f+f+"*$"),u=function(t,e,r){var i={},f=o(function(){return!!a[t]()||"​"!="​"[t]()}),s=i[t]=f?e(h):a[t];r&&(i[r]=s),n(n.P+n.F*f,"String",i)},h=u.trim=function(t,e){return t=String(i(t)),1&e&&(t=t.replace(s,"")),2&e&&(t=t.replace(c,"")),t};t.exports=u},function(t,e,r){var n=r(5)("iterator"),i=!1;try{var o=[7][n]();o.return=function(){i=!0},Array.from(o,function(){throw 2})}catch(t){}t.exports=function(t,e){if(!e&&!i)return!1;var r=!1;try{var o=[7],a=o[n]();a.next=function(){return{done:r=!0}},o[n]=function(){return a},t(o)}catch(t){}return r}},function(t,e,r){"use strict";var n=r(13),i=r(10),o=r(1),a=r(23),f=r(5);t.exports=function(t,e,r){var s=f(t),c=r(a,s,""[t]),u=c[0],h=c[1];o(function(){var e={};return e[s]=function(){return 7},7!=""[t](e)})&&(i(String.prototype,t,u),n(RegExp.prototype,s,2==e?function(t,e){return h.call(t,this,e)}:function(t){return h.call(t,this)}))}},function(t,e,r){var n=r(20),i=r(100),o=r(75),a=r(4),f=r(9),s=r(77),c={},u={};(e=t.exports=function(t,e,r,h,d){var l,p,b,y,v=d?function(){return t}:s(t),g=n(r,h,e?2:1),m=0;if("function"!=typeof v)throw TypeError(t+" is not iterable!");if(o(v)){for(l=f(t.length);l>m;m++)if((y=e?g(a(p=t[m])[0],p[1]):g(t[m]))===c||y===u)return y}else for(b=v.call(t);!(p=b.next()).done;)if((y=i(b,g,p.value,e))===c||y===u)return y}).BREAK=c,e.RETURN=u},function(t,e,r){var n=r(4),i=r(21),o=r(5)("species");t.exports=function(t,e){var r,a=n(t).constructor;return void 0===a||void 0==(r=n(a)[o])?e:i(r)}},function(t,e,r){var n=r(2).navigator;t.exports=n&&n.userAgent||""},function(t,e,r){"use strict";var n=r(2),i=r(0),o=r(10),a=r(41),f=r(27),s=r(52),c=r(40),u=r(3),h=r(1),d=r(50),l=r(36),p=r(67);t.exports=function(t,e,r,b,y,v){var g=n[t],m=g,_=y?"set":"add",w=m&&m.prototype,S={},E=function(t){var e=w[t];o(w,t,"delete"==t?function(t){return!(v&&!u(t))&&e.call(this,0===t?0:t)}:"has"==t?function(t){return!(v&&!u(t))&&e.call(this,0===t?0:t)}:"get"==t?function(t){return v&&!u(t)?void 0:e.call(this,0===t?0:t)}:"add"==t?function(t){return e.call(this,0===t?0:t),this}:function(t,r){return e.call(this,0===t?0:t,r),this})};if("function"==typeof m&&(v||w.forEach&&!h(function(){(new m).entries().next()}))){var M=new m,A=M[_](v?{}:-0,1)!=M,x=h(function(){M.has(1)}),k=d(function(t){new m(t)}),I=!v&&h(function(){for(var t=new m,e=5;e--;)t[_](e,e);return!t.has(-0)});k||((m=e(function(e,r){c(e,m,t);var n=p(new g,e,m);return void 0!=r&&s(r,y,n[_],n),n})).prototype=w,w.constructor=m),(x||I)&&(E("delete"),E("has"),y&&E("get")),(I||A)&&E(_),v&&w.clear&&delete w.clear}else m=b.getConstructor(e,t,y,_),a(m.prototype,r),f.NEED=!0;return l(m,t),S[t]=m,i(i.G+i.W+i.F*(m!=g),S),v||b.setStrong(m,t,y),m}},function(t,e,r){for(var n,i=r(2),o=r(13),a=r(29),f=a("typed_array"),s=a("view"),c=!(!i.ArrayBuffer||!i.DataView),u=c,h=0,d="Int8Array,Uint8Array,Uint8ClampedArray,Int16Array,Uint16Array,Int32Array,Uint32Array,Float32Array,Float64Array".split(",");h<9;)(n=i[d[h++]])?(o(n.prototype,f,!0),o(n.prototype,s,!0)):u=!1;t.exports={ABV:c,CONSTR:u,TYPED:f,VIEW:s}},function(t,e,r){"use strict";function n(t,e,r,n,i,o,a){try{var f=t[o](a),s=f.value}catch(t){return void r(t)}f.done?e(s):Promise.resolve(s).then(n,i)}r.d(e,"a",function(){return i});var i=function(){function t(){var e=this,r=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};if(function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),!r.fn)throw new Error("Listener fn option is missing");if(!r.cb)throw new Error("Listener cb option is missing");this.pollId=null,this.timeoutId=null,this.opts={fn:r.fn,cb:r.cb,interval:r.interval||1e3,timeout:r.timeout||6e4},this.timeoutId=setTimeout(function(){e.stop(),e._success||e.opts.cb(new Error,null)},this.opts.timeout),this._callFn()}return function(t,e,r){e&&function(t,e){for(var r=0;r<e.length;r++){var n=e[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}(t.prototype,e)}(t,[{key:"_callFn",value:function(){var t=function(t){return function(){var e=this,r=arguments;return new Promise(function(i,o){var a=t.apply(e,r);function f(t){n(a,i,o,f,s,"next",t)}function s(t){n(a,i,o,f,s,"throw",t)}f(void 0)})}}(regeneratorRuntime.mark(function t(){var e,r=this;return regeneratorRuntime.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return this.pollId=setTimeout(function(){r._callFn()},this.opts.interval),t.prev=1,t.next=4,this.opts.fn();case 4:(e=t.sent)&&(this.stop(),this._success=!0,this.opts.cb(null,e)),t.next=11;break;case 8:t.prev=8,t.t0=t.catch(1),this.opts.cb(t.t0);case 11:case"end":return t.stop()}},t,this,[[1,8]])}));return function(){return t.apply(this,arguments)}}()},{key:"stop",value:function(){this.pollId&&clearTimeout(this.pollId),this.timeoutId&&clearTimeout(this.timeoutId)}}]),t}()},function(t,e,r){var n=r(3),i=r(2).document,o=n(i)&&n(i.createElement);t.exports=function(t){return o?i.createElement(t):{}}},function(t,e,r){var n=r(8),i=r(2),o=i["__core-js_shared__"]||(i["__core-js_shared__"]={});(t.exports=function(t,e){return o[t]||(o[t]=void 0!==e?e:{})})("versions",[]).push({version:n.version,mode:r(30)?"pure":"global",copyright:"© 2018 Denis Pushkarev (zloirock.ru)"})},function(t,e,r){e.f=r(5)},function(t,e,r){var n=r(59)("keys"),i=r(29);t.exports=function(t){return n[t]||(n[t]=i(t))}},function(t,e){t.exports="constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf".split(",")},function(t,e,r){var n=r(22);t.exports=Array.isArray||function(t){return"Array"==n(t)}},function(t,e,r){var n=r(2).document;t.exports=n&&n.documentElement},function(t,e,r){var n=r(3),i=r(4),o=function(t,e){if(i(t),!n(e)&&null!==e)throw TypeError(e+": can't set as prototype!")};t.exports={set:Object.setPrototypeOf||("__proto__"in{}?function(t,e,n){try{(n=r(20)(Function.call,r(17).f(Object.prototype,"__proto__").set,2))(t,[]),e=!(t instanceof Array)}catch(t){e=!0}return function(t,r){return o(t,r),e?t.__proto__=r:n(t,r),t}}({},!1):void 0),check:o}},function(t,e){t.exports="\t\n\v\f\r   ᠎             　\u2028\u2029\ufeff"},function(t,e,r){var n=r(3),i=r(65).set;t.exports=function(t,e,r){var o,a=e.constructor;return a!==r&&"function"==typeof a&&(o=a.prototype)!==r.prototype&&n(o)&&i&&i(t,o),t}},function(t,e,r){"use strict";var n=r(24),i=r(23);t.exports=function(t){var e=String(i(this)),r="",o=n(t);if(o<0||o==1/0)throw RangeError("Count can't be negative");for(;o>0;(o>>>=1)&&(e+=e))1&o&&(r+=e);return r}},function(t,e){t.exports=Math.sign||function(t){return 0==(t=+t)||t!=t?t:t<0?-1:1}},function(t,e){var r=Math.expm1;t.exports=!r||r(10)>22025.465794806718||r(10)<22025.465794806718||-2e-17!=r(-2e-17)?function(t){return 0==(t=+t)?t:t>-1e-6&&t<1e-6?t+t*t/2:Math.exp(t)-1}:r},function(t,e,r){"use strict";var n=r(30),i=r(0),o=r(10),a=r(13),f=r(37),s=r(99),c=r(36),u=r(35),h=r(5)("iterator"),d=!([].keys&&"next"in[].keys()),l=function(){return this};t.exports=function(t,e,r,p,b,y,v){s(r,e,p);var g,m,_,w=function(t){if(!d&&t in A)return A[t];switch(t){case"keys":case"values":return function(){return new r(this,t)}}return function(){return new r(this,t)}},S=e+" Iterator",E="values"==b,M=!1,A=t.prototype,x=A[h]||A["@@iterator"]||b&&A[b],k=x||w(b),I=b?E?w("entries"):k:void 0,B="Array"==e&&A.entries||x;if(B&&(_=u(B.call(new t)))!==Object.prototype&&_.next&&(c(_,S,!0),n||"function"==typeof _[h]||a(_,h,l)),E&&x&&"values"!==x.name&&(M=!0,k=function(){return x.call(this)}),n&&!v||!d&&!M&&A[h]||a(A,h,k),f[e]=k,f[S]=l,b)if(g={values:E?k:w("values"),keys:y?k:w("keys"),entries:I},v)for(m in g)m in A||o(A,m,g[m]);else i(i.P+i.F*(d||M),e,g);return g}},function(t,e,r){var n=r(73),i=r(23);t.exports=function(t,e,r){if(n(e))throw TypeError("String#"+r+" doesn't accept regex!");return String(i(t))}},function(t,e,r){var n=r(3),i=r(22),o=r(5)("match");t.exports=function(t){var e;return n(t)&&(void 0!==(e=t[o])?!!e:"RegExp"==i(t))}},function(t,e,r){var n=r(5)("match");t.exports=function(t){var e=/./;try{"/./"[t](e)}catch(r){try{return e[n]=!1,!"/./"[t](e)}catch(t){}}return!0}},function(t,e,r){var n=r(37),i=r(5)("iterator"),o=Array.prototype;t.exports=function(t){return void 0!==t&&(n.Array===t||o[i]===t)}},function(t,e,r){"use strict";var n=r(6),i=r(28);t.exports=function(t,e,r){e in t?n.f(t,e,i(0,r)):t[e]=r}},function(t,e,r){var n=r(48),i=r(5)("iterator"),o=r(37);t.exports=r(8).getIteratorMethod=function(t){if(void 0!=t)return t[i]||t["@@iterator"]||o[n(t)]}},function(t,e,r){"use strict";var n=r(15),i=r(32),o=r(9);t.exports=function(t){for(var e=n(this),r=o(e.length),a=arguments.length,f=i(a>1?arguments[1]:void 0,r),s=a>2?arguments[2]:void 0,c=void 0===s?r:i(s,r);c>f;)e[f++]=t;return e}},function(t,e,r){"use strict";var n=r(38),i=r(103),o=r(37),a=r(14);t.exports=r(71)(Array,"Array",function(t,e){this._t=a(t),this._i=0,this._k=e},function(){var t=this._t,e=this._k,r=this._i++;return!t||r>=t.length?(this._t=void 0,i(1)):i(0,"keys"==e?r:"values"==e?t[r]:[r,t[r]])},"values"),o.Arguments=o.Array,n("keys"),n("values"),n("entries")},function(t,e,r){"use strict";var n=r(4);t.exports=function(){var t=n(this),e="";return t.global&&(e+="g"),t.ignoreCase&&(e+="i"),t.multiline&&(e+="m"),t.unicode&&(e+="u"),t.sticky&&(e+="y"),e}},function(t,e,r){var n,i,o,a=r(20),f=r(92),s=r(64),c=r(58),u=r(2),h=u.process,d=u.setImmediate,l=u.clearImmediate,p=u.MessageChannel,b=u.Dispatch,y=0,v={},g=function(){var t=+this;if(v.hasOwnProperty(t)){var e=v[t];delete v[t],e()}},m=function(t){g.call(t.data)};d&&l||(d=function(t){for(var e=[],r=1;arguments.length>r;)e.push(arguments[r++]);return v[++y]=function(){f("function"==typeof t?t:Function(t),e)},n(y),y},l=function(t){delete v[t]},"process"==r(22)(h)?n=function(t){h.nextTick(a(g,t,1))}:b&&b.now?n=function(t){b.now(a(g,t,1))}:p?(o=(i=new p).port2,i.port1.onmessage=m,n=a(o.postMessage,o,1)):u.addEventListener&&"function"==typeof postMessage&&!u.importScripts?(n=function(t){u.postMessage(t+"","*")},u.addEventListener("message",m,!1)):n="onreadystatechange"in c("script")?function(t){s.appendChild(c("script")).onreadystatechange=function(){s.removeChild(this),g.call(t)}}:function(t){setTimeout(a(g,t,1),0)}),t.exports={set:d,clear:l}},function(t,e,r){"use strict";var n=r(2),i=r(7),o=r(30),a=r(56),f=r(13),s=r(41),c=r(1),u=r(40),h=r(24),d=r(9),l=r(110),p=r(34).f,b=r(6).f,y=r(78),v=r(36),g="prototype",m="Wrong index!",_=n.ArrayBuffer,w=n.DataView,S=n.Math,E=n.RangeError,M=n.Infinity,A=_,x=S.abs,k=S.pow,I=S.floor,B=S.log,R=S.LN2,P=i?"_b":"buffer",T=i?"_l":"byteLength",L=i?"_o":"byteOffset";function O(t,e,r){var n,i,o,a=new Array(r),f=8*r-e-1,s=(1<<f)-1,c=s>>1,u=23===e?k(2,-24)-k(2,-77):0,h=0,d=t<0||0===t&&1/t<0?1:0;for((t=x(t))!=t||t===M?(i=t!=t?1:0,n=s):(n=I(B(t)/R),t*(o=k(2,-n))<1&&(n--,o*=2),(t+=n+c>=1?u/o:u*k(2,1-c))*o>=2&&(n++,o/=2),n+c>=s?(i=0,n=s):n+c>=1?(i=(t*o-1)*k(2,e),n+=c):(i=t*k(2,c-1)*k(2,e),n=0));e>=8;a[h++]=255&i,i/=256,e-=8);for(n=n<<e|i,f+=e;f>0;a[h++]=255&n,n/=256,f-=8);return a[--h]|=128*d,a}function C(t,e,r){var n,i=8*r-e-1,o=(1<<i)-1,a=o>>1,f=i-7,s=r-1,c=t[s--],u=127&c;for(c>>=7;f>0;u=256*u+t[s],s--,f-=8);for(n=u&(1<<-f)-1,u>>=-f,f+=e;f>0;n=256*n+t[s],s--,f-=8);if(0===u)u=1-a;else{if(u===o)return n?NaN:c?-M:M;n+=k(2,e),u-=a}return(c?-1:1)*n*k(2,u-e)}function j(t){return t[3]<<24|t[2]<<16|t[1]<<8|t[0]}function N(t){return[255&t]}function D(t){return[255&t,t>>8&255]}function U(t){return[255&t,t>>8&255,t>>16&255,t>>24&255]}function q(t){return O(t,52,8)}function z(t){return O(t,23,4)}function F(t,e,r){b(t[g],e,{get:function(){return this[r]}})}function K(t,e,r,n){var i=l(+r);if(i+e>t[T])throw E(m);var o=t[P]._b,a=i+t[L],f=o.slice(a,a+e);return n?f:f.reverse()}function Y(t,e,r,n,i,o){var a=l(+r);if(a+e>t[T])throw E(m);for(var f=t[P]._b,s=a+t[L],c=n(+i),u=0;u<e;u++)f[s+u]=c[o?u:e-u-1]}if(a.ABV){if(!c(function(){_(1)})||!c(function(){new _(-1)})||c(function(){return new _,new _(1.5),new _(NaN),"ArrayBuffer"!=_.name})){for(var V,H=(_=function(t){return u(this,_),new A(l(t))})[g]=A[g],W=p(A),G=0;W.length>G;)(V=W[G++])in _||f(_,V,A[V]);o||(H.constructor=_)}var X=new w(new _(2)),J=w[g].setInt8;X.setInt8(0,2147483648),X.setInt8(1,2147483649),!X.getInt8(0)&&X.getInt8(1)||s(w[g],{setInt8:function(t,e){J.call(this,t,e<<24>>24)},setUint8:function(t,e){J.call(this,t,e<<24>>24)}},!0)}else _=function(t){u(this,_,"ArrayBuffer");var e=l(t);this._b=y.call(new Array(e),0),this[T]=e},w=function(t,e,r){u(this,w,"DataView"),u(t,_,"DataView");var n=t[T],i=h(e);if(i<0||i>n)throw E("Wrong offset!");if(i+(r=void 0===r?n-i:d(r))>n)throw E("Wrong length!");this[P]=t,this[L]=i,this[T]=r},i&&(F(_,"byteLength","_l"),F(w,"buffer","_b"),F(w,"byteLength","_l"),F(w,"byteOffset","_o")),s(w[g],{getInt8:function(t){return K(this,1,t)[0]<<24>>24},getUint8:function(t){return K(this,1,t)[0]},getInt16:function(t){var e=K(this,2,t,arguments[1]);return(e[1]<<8|e[0])<<16>>16},getUint16:function(t){var e=K(this,2,t,arguments[1]);return e[1]<<8|e[0]},getInt32:function(t){return j(K(this,4,t,arguments[1]))},getUint32:function(t){return j(K(this,4,t,arguments[1]))>>>0},getFloat32:function(t){return C(K(this,4,t,arguments[1]),23,4)},getFloat64:function(t){return C(K(this,8,t,arguments[1]),52,8)},setInt8:function(t,e){Y(this,1,t,N,e)},setUint8:function(t,e){Y(this,1,t,N,e)},setInt16:function(t,e){Y(this,2,t,D,e,arguments[2])},setUint16:function(t,e){Y(this,2,t,D,e,arguments[2])},setInt32:function(t,e){Y(this,4,t,U,e,arguments[2])},setUint32:function(t,e){Y(this,4,t,U,e,arguments[2])},setFloat32:function(t,e){Y(this,4,t,z,e,arguments[2])},setFloat64:function(t,e){Y(this,8,t,q,e,arguments[2])}});v(_,"ArrayBuffer"),v(w,"DataView"),f(w[g],a.VIEW,!0),e.ArrayBuffer=_,e.DataView=w},function(t,e){t.exports=function(t){var e={};function r(n){if(e[n])return e[n].exports;var i=e[n]={i:n,l:!1,exports:{}};return t[n].call(i.exports,i,i.exports,r),i.l=!0,i.exports}return r.m=t,r.c=e,r.d=function(t,e,n){r.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:n})},r.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},r.t=function(t,e){if(1&e&&(t=r(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var n=Object.create(null);if(r.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var i in t)r.d(n,i,function(e){return t[e]}.bind(null,i));return n},r.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return r.d(e,"a",e),e},r.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},r.p="",r(r.s=0)}([function(t,e,r){t.exports=r(1)},function(t,e,r){"use strict";function n(t){for(var e=1;e<arguments.length;e++){var r=null!=arguments[e]?arguments[e]:{},n=Object.keys(r);"function"==typeof Object.getOwnPropertySymbols&&(n=n.concat(Object.getOwnPropertySymbols(r).filter(function(t){return Object.getOwnPropertyDescriptor(r,t).enumerable}))),n.forEach(function(e){i(t,e,r[e])})}return t}function i(t,e,r){return e in t?Object.defineProperty(t,e,{value:r,enumerable:!0,configurable:!0,writable:!0}):t[e]=r,t}function o(t){return(o="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}r.r(e),e.default=function(t){if(!t||"string"!=typeof t)throw new Error("URI is not a string");var e=(t=decodeURIComponent(t)).indexOf(":"),r=-1!==t.indexOf("?")?t.indexOf("?"):void 0;return n({protocol:t.substring(0,e)},function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null,r={erc681:{prefix:"pay",separators:["@","/"],keys:["targetAddress","chainId","functionName"]},erc1328:{prefix:"wc",separators:["@"],keys:["sessionId","version"]}};e&&"object"===o(e)&&(r=n({},r,{config:e}));var i=Object.keys(r).filter(function(e){return t.startsWith(r[e].prefix)})[0]||"";i||(i=t.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi)?"erc1328":"erc681");var a={prefix:r[i].prefix};t=t.replace("".concat(r[i].prefix,"-"),"");var f=[];return r[i].separators.reverse().forEach(function(e,r,n){var i;i=r===n.length?t.length:f[0];var o=t.indexOf(e)&&-1!==t.indexOf(e)?t.indexOf(e):i;f.unshift(o)}),r[i].keys.forEach(function(e,r,n){var i=0!==r?f[r-1]+1:0,o=r!==n.length?f[r]:void 0;a[e]=0!==r&&f[r-1]===f[r]?"":t.substring(i,o)}),a}(t.substring(e+1,r)),function(t){if(!t)return{};for(var e={},r=("?"===t[0]?t.substr(1):t).split("&"),n=0;n<r.length;n++){var i=r[n].match(/\w+(?==)/i)?r[n].match(/\w+(?==)/i)[0]:null,o=r[n].match(/=.+/i)?r[n].match(/=.+/i)[0].substr(1):"";i&&(e[decodeURIComponent(i)]=decodeURIComponent(o))}return e}(r?t.substring(r):""))}}])},function(t,e){var r;r=function(){return this}();try{r=r||Function("return this")()||(0,eval)("this")}catch(t){"object"==typeof window&&(r=window)}t.exports=r},function(t,e,r){t.exports=!r(7)&&!r(1)(function(){return 7!=Object.defineProperty(r(58)("div"),"a",{get:function(){return 7}}).a})},function(t,e,r){var n=r(2),i=r(8),o=r(30),a=r(60),f=r(6).f;t.exports=function(t){var e=i.Symbol||(i.Symbol=o?{}:n.Symbol||{});"_"==t.charAt(0)||t in e||f(e,t,{value:a.f(t)})}},function(t,e,r){var n=r(12),i=r(14),o=r(46)(!1),a=r(61)("IE_PROTO");t.exports=function(t,e){var r,f=i(t),s=0,c=[];for(r in f)r!=a&&n(f,r)&&c.push(r);for(;e.length>s;)n(f,r=e[s++])&&(~o(c,r)||c.push(r));return c}},function(t,e,r){var n=r(6),i=r(4),o=r(31);t.exports=r(7)?Object.defineProperties:function(t,e){i(t);for(var r,a=o(e),f=a.length,s=0;f>s;)n.f(t,r=a[s++],e[r]);return t}},function(t,e,r){var n=r(14),i=r(34).f,o={}.toString,a="object"==typeof window&&window&&Object.getOwnPropertyNames?Object.getOwnPropertyNames(window):[];t.exports.f=function(t){return a&&"[object Window]"==o.call(t)?function(t){try{return i(t)}catch(t){return a.slice()}}(t):i(n(t))}},function(t,e,r){"use strict";var n=r(31),i=r(47),o=r(45),a=r(15),f=r(44),s=Object.assign;t.exports=!s||r(1)(function(){var t={},e={},r=Symbol(),n="abcdefghijklmnopqrst";return t[r]=7,n.split("").forEach(function(t){e[t]=t}),7!=s({},t)[r]||Object.keys(s({},e)).join("")!=n})?function(t,e){for(var r=a(t),s=arguments.length,c=1,u=i.f,h=o.f;s>c;)for(var d,l=f(arguments[c++]),p=u?n(l).concat(u(l)):n(l),b=p.length,y=0;b>y;)h.call(l,d=p[y++])&&(r[d]=l[d]);return r}:s},function(t,e,r){"use strict";var n=r(21),i=r(3),o=r(92),a=[].slice,f={};t.exports=Function.bind||function(t){var e=n(this),r=a.call(arguments,1),s=function(){var n=r.concat(a.call(arguments));return this instanceof s?function(t,e,r){if(!(e in f)){for(var n=[],i=0;i<e;i++)n[i]="a["+i+"]";f[e]=Function("F,a","return new F("+n.join(",")+")")}return f[e](t,r)}(e,n.length,n):o(e,n,t)};return i(e.prototype)&&(s.prototype=e.prototype),s}},function(t,e){t.exports=function(t,e,r){var n=void 0===r;switch(e.length){case 0:return n?t():t.call(r);case 1:return n?t(e[0]):t.call(r,e[0]);case 2:return n?t(e[0],e[1]):t.call(r,e[0],e[1]);case 3:return n?t(e[0],e[1],e[2]):t.call(r,e[0],e[1],e[2]);case 4:return n?t(e[0],e[1],e[2],e[3]):t.call(r,e[0],e[1],e[2],e[3])}return t.apply(r,e)}},function(t,e,r){var n=r(2).parseInt,i=r(49).trim,o=r(66),a=/^[-+]?0[xX]/;t.exports=8!==n(o+"08")||22!==n(o+"0x16")?function(t,e){var r=i(String(t),3);return n(r,e>>>0||(a.test(r)?16:10))}:n},function(t,e,r){var n=r(2).parseFloat,i=r(49).trim;t.exports=1/n(r(66)+"-0")!=-1/0?function(t){var e=i(String(t),3),r=n(e);return 0===r&&"-"==e.charAt(0)?-0:r}:n},function(t,e,r){var n=r(22);t.exports=function(t,e){if("number"!=typeof t&&"Number"!=n(t))throw TypeError(e);return+t}},function(t,e,r){var n=r(3),i=Math.floor;t.exports=function(t){return!n(t)&&isFinite(t)&&i(t)===t}},function(t,e){t.exports=Math.log1p||function(t){return(t=+t)>-1e-8&&t<1e-8?t-t*t/2:Math.log(1+t)}},function(t,e,r){var n=r(24),i=r(23);t.exports=function(t){return function(e,r){var o,a,f=String(i(e)),s=n(r),c=f.length;return s<0||s>=c?t?"":void 0:(o=f.charCodeAt(s))<55296||o>56319||s+1===c||(a=f.charCodeAt(s+1))<56320||a>57343?t?f.charAt(s):o:t?f.slice(s,s+2):a-56320+(o-55296<<10)+65536}}},function(t,e,r){"use strict";var n=r(33),i=r(28),o=r(36),a={};r(13)(a,r(5)("iterator"),function(){return this}),t.exports=function(t,e,r){t.prototype=n(a,{next:i(1,r)}),o(t,e+" Iterator")}},function(t,e,r){var n=r(4);t.exports=function(t,e,r,i){try{return i?e(n(r)[0],r[1]):e(r)}catch(e){var o=t.return;throw void 0!==o&&n(o.call(t)),e}}},function(t,e,r){var n=r(21),i=r(15),o=r(44),a=r(9);t.exports=function(t,e,r,f,s){n(e);var c=i(t),u=o(c),h=a(c.length),d=s?h-1:0,l=s?-1:1;if(r<2)for(;;){if(d in u){f=u[d],d+=l;break}if(d+=l,s?d<0:h<=d)throw TypeError("Reduce of empty array with no initial value")}for(;s?d>=0:h>d;d+=l)d in u&&(f=e(f,u[d],d,c));return f}},function(t,e,r){"use strict";var n=r(15),i=r(32),o=r(9);t.exports=[].copyWithin||function(t,e){var r=n(this),a=o(r.length),f=i(t,a),s=i(e,a),c=arguments.length>2?arguments[2]:void 0,u=Math.min((void 0===c?a:i(c,a))-s,a-f),h=1;for(s<f&&f<s+u&&(h=-1,s+=u-1,f+=u-1);u-- >0;)s in r?r[f]=r[s]:delete r[f],f+=h,s+=h;return r}},function(t,e){t.exports=function(t,e){return{value:e,done:!!t}}},function(t,e,r){r(7)&&"g"!=/./g.flags&&r(6).f(RegExp.prototype,"flags",{configurable:!0,get:r(80)})},function(t,e,r){"use strict";var n,i,o,a,f=r(30),s=r(2),c=r(20),u=r(48),h=r(0),d=r(3),l=r(21),p=r(40),b=r(52),y=r(53),v=r(81).set,g=r(230)(),m=r(106),_=r(231),w=r(54),S=r(107),E=s.TypeError,M=s.process,A=M&&M.versions,x=A&&A.v8||"",k=s.Promise,I="process"==u(M),B=function(){},R=i=m.f,P=!!function(){try{var t=k.resolve(1),e=(t.constructor={})[r(5)("species")]=function(t){t(B,B)};return(I||"function"==typeof PromiseRejectionEvent)&&t.then(B)instanceof e&&0!==x.indexOf("6.6")&&-1===w.indexOf("Chrome/66")}catch(t){}}(),T=function(t){var e;return!(!d(t)||"function"!=typeof(e=t.then))&&e},L=function(t,e){if(!t._n){t._n=!0;var r=t._c;g(function(){for(var n=t._v,i=1==t._s,o=0,a=function(e){var r,o,a,f=i?e.ok:e.fail,s=e.resolve,c=e.reject,u=e.domain;try{f?(i||(2==t._h&&j(t),t._h=1),!0===f?r=n:(u&&u.enter(),r=f(n),u&&(u.exit(),a=!0)),r===e.promise?c(E("Promise-chain cycle")):(o=T(r))?o.call(r,s,c):s(r)):c(n)}catch(t){u&&!a&&u.exit(),c(t)}};r.length>o;)a(r[o++]);t._c=[],t._n=!1,e&&!t._h&&O(t)})}},O=function(t){v.call(s,function(){var e,r,n,i=t._v,o=C(t);if(o&&(e=_(function(){I?M.emit("unhandledRejection",i,t):(r=s.onunhandledrejection)?r({promise:t,reason:i}):(n=s.console)&&n.error&&n.error("Unhandled promise rejection",i)}),t._h=I||C(t)?2:1),t._a=void 0,o&&e.e)throw e.v})},C=function(t){return 1!==t._h&&0===(t._a||t._c).length},j=function(t){v.call(s,function(){var e;I?M.emit("rejectionHandled",t):(e=s.onrejectionhandled)&&e({promise:t,reason:t._v})})},N=function(t){var e=this;e._d||(e._d=!0,(e=e._w||e)._v=t,e._s=2,e._a||(e._a=e._c.slice()),L(e,!0))},D=function(t){var e,r=this;if(!r._d){r._d=!0,r=r._w||r;try{if(r===t)throw E("Promise can't be resolved itself");(e=T(t))?g(function(){var n={_w:r,_d:!1};try{e.call(t,c(D,n,1),c(N,n,1))}catch(t){N.call(n,t)}}):(r._v=t,r._s=1,L(r,!1))}catch(t){N.call({_w:r,_d:!1},t)}}};P||(k=function(t){p(this,k,"Promise","_h"),l(t),n.call(this);try{t(c(D,this,1),c(N,this,1))}catch(t){N.call(this,t)}},(n=function(t){this._c=[],this._a=void 0,this._s=0,this._d=!1,this._v=void 0,this._h=0,this._n=!1}).prototype=r(41)(k.prototype,{then:function(t,e){var r=R(y(this,k));return r.ok="function"!=typeof t||t,r.fail="function"==typeof e&&e,r.domain=I?M.domain:void 0,this._c.push(r),this._a&&this._a.push(r),this._s&&L(this,!1),r.promise},catch:function(t){return this.then(void 0,t)}}),o=function(){var t=new n;this.promise=t,this.resolve=c(D,t,1),this.reject=c(N,t,1)},m.f=R=function(t){return t===k||t===a?new o(t):i(t)}),h(h.G+h.W+h.F*!P,{Promise:k}),r(36)(k,"Promise"),r(39)("Promise"),a=r(8).Promise,h(h.S+h.F*!P,"Promise",{reject:function(t){var e=R(this);return(0,e.reject)(t),e.promise}}),h(h.S+h.F*(f||!P),"Promise",{resolve:function(t){return S(f&&this===a?k:this,t)}}),h(h.S+h.F*!(P&&r(50)(function(t){k.all(t).catch(B)})),"Promise",{all:function(t){var e=this,r=R(e),n=r.resolve,i=r.reject,o=_(function(){var r=[],o=0,a=1;b(t,!1,function(t){var f=o++,s=!1;r.push(void 0),a++,e.resolve(t).then(function(t){s||(s=!0,r[f]=t,--a||n(r))},i)}),--a||n(r)});return o.e&&i(o.v),r.promise},race:function(t){var e=this,r=R(e),n=r.reject,i=_(function(){b(t,!1,function(t){e.resolve(t).then(r.resolve,n)})});return i.e&&n(i.v),r.promise}})},function(t,e,r){"use strict";var n=r(21);t.exports.f=function(t){return new function(t){var e,r;this.promise=new t(function(t,n){if(void 0!==e||void 0!==r)throw TypeError("Bad Promise constructor");e=t,r=n}),this.resolve=n(e),this.reject=n(r)}(t)}},function(t,e,r){var n=r(4),i=r(3),o=r(106);t.exports=function(t,e){if(n(t),i(e)&&e.constructor===t)return e;var r=o.f(t);return(0,r.resolve)(e),r.promise}},function(t,e,r){"use strict";var n=r(6).f,i=r(33),o=r(41),a=r(20),f=r(40),s=r(52),c=r(71),u=r(103),h=r(39),d=r(7),l=r(27).fastKey,p=r(42),b=d?"_s":"size",y=function(t,e){var r,n=l(e);if("F"!==n)return t._i[n];for(r=t._f;r;r=r.n)if(r.k==e)return r};t.exports={getConstructor:function(t,e,r,c){var u=t(function(t,n){f(t,u,e,"_i"),t._t=e,t._i=i(null),t._f=void 0,t._l=void 0,t[b]=0,void 0!=n&&s(n,r,t[c],t)});return o(u.prototype,{clear:function(){for(var t=p(this,e),r=t._i,n=t._f;n;n=n.n)n.r=!0,n.p&&(n.p=n.p.n=void 0),delete r[n.i];t._f=t._l=void 0,t[b]=0},delete:function(t){var r=p(this,e),n=y(r,t);if(n){var i=n.n,o=n.p;delete r._i[n.i],n.r=!0,o&&(o.n=i),i&&(i.p=o),r._f==n&&(r._f=i),r._l==n&&(r._l=o),r[b]--}return!!n},forEach:function(t){p(this,e);for(var r,n=a(t,arguments.length>1?arguments[1]:void 0,3);r=r?r.n:this._f;)for(n(r.v,r.k,this);r&&r.r;)r=r.p},has:function(t){return!!y(p(this,e),t)}}),d&&n(u.prototype,"size",{get:function(){return p(this,e)[b]}}),u},def:function(t,e,r){var n,i,o=y(t,e);return o?o.v=r:(t._l=o={i:i=l(e,!0),k:e,v:r,p:n=t._l,n:void 0,r:!1},t._f||(t._f=o),n&&(n.n=o),t[b]++,"F"!==i&&(t._i[i]=o)),t},getEntry:y,setStrong:function(t,e,r){c(t,e,function(t,r){this._t=p(t,e),this._k=r,this._l=void 0},function(){for(var t=this._k,e=this._l;e&&e.r;)e=e.p;return this._t&&(this._l=e=e?e.n:this._t._f)?u(0,"keys"==t?e.k:"values"==t?e.v:[e.k,e.v]):(this._t=void 0,u(1))},r?"entries":"values",!r,!0),h(e)}}},function(t,e,r){"use strict";var n=r(41),i=r(27).getWeak,o=r(4),a=r(3),f=r(40),s=r(52),c=r(19),u=r(12),h=r(42),d=c(5),l=c(6),p=0,b=function(t){return t._l||(t._l=new y)},y=function(){this.a=[]},v=function(t,e){return d(t.a,function(t){return t[0]===e})};y.prototype={get:function(t){var e=v(this,t);if(e)return e[1]},has:function(t){return!!v(this,t)},set:function(t,e){var r=v(this,t);r?r[1]=e:this.a.push([t,e])},delete:function(t){var e=l(this.a,function(e){return e[0]===t});return~e&&this.a.splice(e,1),!!~e}},t.exports={getConstructor:function(t,e,r,o){var c=t(function(t,n){f(t,c,e,"_i"),t._t=e,t._i=p++,t._l=void 0,void 0!=n&&s(n,r,t[o],t)});return n(c.prototype,{delete:function(t){if(!a(t))return!1;var r=i(t);return!0===r?b(h(this,e)).delete(t):r&&u(r,this._i)&&delete r[this._i]},has:function(t){if(!a(t))return!1;var r=i(t);return!0===r?b(h(this,e)).has(t):r&&u(r,this._i)}}),c},def:function(t,e,r){var n=i(o(e),!0);return!0===n?b(t).set(e,r):n[t._i]=r,t},ufstore:b}},function(t,e,r){var n=r(24),i=r(9);t.exports=function(t){if(void 0===t)return 0;var e=n(t),r=i(e);if(e!==r)throw RangeError("Wrong length!");return r}},function(t,e,r){var n=r(34),i=r(47),o=r(4),a=r(2).Reflect;t.exports=a&&a.ownKeys||function(t){var e=n.f(o(t)),r=i.f;return r?e.concat(r(t)):e}},function(t,e,r){var n=r(9),i=r(68),o=r(23);t.exports=function(t,e,r,a){var f=String(o(t)),s=f.length,c=void 0===r?" ":String(r),u=n(e);if(u<=s||""==c)return f;var h=u-s,d=i.call(c,Math.ceil(h/c.length));return d.length>h&&(d=d.slice(0,h)),a?d+f:f+d}},function(t,e,r){var n=r(31),i=r(14),o=r(45).f;t.exports=function(t){return function(e){for(var r,a=i(e),f=n(a),s=f.length,c=0,u=[];s>c;)o.call(a,r=f[c++])&&u.push(t?[r,a[r]]:a[r]);return u}}},function(t,e,r){"use strict";(function(t){r.d(e,"a",function(){return l});var n=r(43),i=r.n(n),o=r(83),a=r.n(o),f=r(57);function s(t){return(s="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}function c(t){for(var e=1;e<arguments.length;e++){var r=null!=arguments[e]?arguments[e]:{},n=Object.keys(r);"function"==typeof Object.getOwnPropertySymbols&&(n=n.concat(Object.getOwnPropertySymbols(r).filter(function(t){return Object.getOwnPropertyDescriptor(r,t).enumerable}))),n.forEach(function(e){u(t,e,r[e])})}return t}function u(t,e,r){return e in t?Object.defineProperty(t,e,{value:r,enumerable:!0,configurable:!0,writable:!0}):t[e]=r,t}function h(t,e,r,n,i,o,a){try{var f=t[o](a),s=f.value}catch(t){return void r(t)}f.done?e(s):Promise.resolve(s).then(n,i)}function d(t){return function(){var e=this,r=arguments;return new Promise(function(n,i){var o=t.apply(e,r);function a(t){h(o,n,i,a,f,"next",t)}function f(t){h(o,n,i,a,f,"throw",t)}a(void 0)})}}var l=function(){function e(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,e);var r=this.checkObject(t,"options");this.bridgeUrl=r.bridgeUrl,this.sessionId=r.sessionId,this.symKey=r.symKey,this.dappName=r.dappName,this.protocol=r.protocol||"ethereum",this.chainId=r.chainId||1,this.expires=r.expires||null,this.accounts=r.accounts||[],this.uri=r.uri||"",this.isConnected=!1,this.listeners=[]}return function(t,e,r){e&&function(t,e){for(var r=0;r<e.length;r++){var n=e[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}(t.prototype,e)}(e,[{key:"encrypt",value:function(){var e=d(regeneratorRuntime.mark(function e(r){var n,o,a,f,s,c,u,h,d=arguments;return regeneratorRuntime.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:if(n=d.length>1&&void 0!==d[1]?d[1]:null,o=this._symKey){e.next=4;break}throw new Error("Shared key is required. Please set `symKey` before using encryption");case 4:if(a=n){e.next=9;break}return e.next=8,this.generateKey(128);case 8:a=e.sent;case 9:return f=t.from(a),s=JSON.stringify({data:r}),(c=i.a.createCipheriv("AES-256-CBC",o,f)).setEncoding("hex"),c.write(s),c.end(),u=c.read(),(h=i.a.createHmac("SHA256",o)).update(u),h.update(f.toString("hex")),e.abrupt("return",{data:u,hmac:h.digest("hex"),iv:f.toString("hex")});case 20:case"end":return e.stop()}},e,this)}));return function(t){return e.apply(this,arguments)}}()},{key:"decrypt",value:function(e){var r=e.data,n=e.hmac,o=e.iv,a=this._symKey,f=t.from(o,"hex"),s=t.from(n,"hex"),c=i.a.createHmac("SHA256",a);c.update(r),c.update(f.toString("hex"));var u=t.from(c.digest("hex"),"hex");if(0!==t.compare(u,s))return null;var h=i.a.createDecipheriv("AES-256-CBC",a,f),d=h.update(r,"hex","utf8");return JSON.parse(d+h.final("utf8"))}},{key:"generateKey",value:function(){var t=d(regeneratorRuntime.mark(function t(){var e,r,n,o,a=arguments;return regeneratorRuntime.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return e=a.length>0&&void 0!==a[0]?a[0]:256,r=e/8,n=i.a.randomBytes(r),t.next=5,n;case 5:return o=t.sent,t.abrupt("return",o);case 7:case"end":return t.stop()}},t,this)}));return function(){return t.apply(this,arguments)}}()},{key:"formatTransactionRequest",value:function(t){var e=this.protocol,r=t.to,n=this.chainId,i="".concat(e,":pay-").concat(r,"@").concat(n);if(t.functionName&&(i+="/"+t.functionName),t.parameters){for(var o="",a=Object.keys(t.parameters);a.length;){var f=a.pop(),s=t.parameters[f].toString();o+=f+"="+encodeURIComponent(s),a.length&&(o+="&")}i+="?"+o}return i}},{key:"parseTransactionRequest",value:function(t){var e=a()(t);if(e.prefix&&"pay"===e.prefix){if(e.chainId!==this.chainId)throw new Error("chainId does not match");if(e.protocol!==this.protocol)throw new Error("Protocol does not match");return e}throw new Error("URI string doesn't follow ERC-681 standard")}},{key:"_formatWalletConnectURI",value:function(){var e=this.protocol||"";if(!e||"string"!=typeof e)throw new Error("protocol parameter is missing or invalid");var r=this.sessionId||"";if(!r||"string"!=typeof r)throw new Error("sessionId parameter is missing or invalid");var n=encodeURIComponent(this.dappName)||"";if(!n||"string"!=typeof n)throw new Error("name parameter is missing or invalid");var i=encodeURIComponent(this.bridgeUrl)||"";if(!i||"string"!=typeof i)throw new Error("bridgeUrl parameter is missing or invalid");var o=t.from(this.symKey,"hex").toString("base64")||"";if(!o||"string"!=typeof o)throw new Error("symKey parameter is missing or invalid");return"".concat(e,":wc-").concat(r,"@").concat("1","?name=").concat(n,"&bridge=").concat(i,"&symKey=").concat(o)}},{key:"_parseWalletConnectURI",value:function(e){var r=a()(e);if(r.prefix&&"wc"===r.prefix){if(!r.sessionId)throw Error("Missing sessionId field");if(!r.bridge)throw Error("Missing bridge url field");if(!r.symKey)throw Error("Missing symKey field");if(!r.name)throw Error("Missing dapp name field");if(r.protocol!==this.protocol)throw new Error("Protocol does not match");var n=t.from(r.symKey,"base64");return{protocol:r.protocol,version:r.version,sessionId:r.sessionId,bridgeUrl:r.bridge,dappName:r.name,symKey:n}}throw new Error("URI string doesn't follow ERC-1328 standard")}},{key:"_fetchBridge",value:function(){var t=d(regeneratorRuntime.mark(function t(e){var r,n,i,o,a,f,s,u=arguments;return regeneratorRuntime.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return r=u.length>1&&void 0!==u[1]?u[1]:null,n=u.length>2&&void 0!==u[2]?u[2]:null,i="".concat(this.bridgeUrl).concat(e),o={method:"GET",headers:{Accept:"application/json","Content-Type":"application/json"}},r&&(o=c({},o,r)),n&&(o.body=JSON.stringify(n)),t.next=8,fetch(i,o);case 8:if(204!==(a=t.sent).status){t.next=11;break}return t.abrupt("return",null);case 11:if(!(a.status>=400)){t.next=13;break}throw new Error(a.statusText);case 13:return f=null,t.next=16,a.text();case 16:return(s=t.sent).length&&(f=JSON.parse(s)),t.abrupt("return",f);case 19:case"end":return t.stop()}},t,this)}));return function(e){return t.apply(this,arguments)}}()},{key:"_decryptPayload",value:function(t){var e=t;if(t.encryptionPayload){var r=this.decrypt(t.encryptionPayload);r&&delete(e=c({},e,r)).encryptionPayload}return e}},{key:"_getEncryptedData",value:function(){var t=d(regeneratorRuntime.mark(function t(e){var r,n,i;return regeneratorRuntime.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,this._fetchBridge(e);case 2:if(r=t.sent){t.next=5;break}return t.abrupt("return",null);case 5:return n=r.data,i=this._decryptPayload(n),t.abrupt("return",i);case 8:case"end":return t.stop()}},t,this)}));return function(e){return t.apply(this,arguments)}}()},{key:"_getMultipleEncryptedData",value:function(){var t=d(regeneratorRuntime.mark(function t(e){var r,n,i,o=this;return regeneratorRuntime.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,this._fetchBridge(e);case 2:if(r=t.sent){t.next=5;break}return t.abrupt("return",null);case 5:return n=r.data,Array.isArray(n)?i=n.map(function(t){return o._decryptPayload(t)}):"object"===s(n)&&(i={},Object.keys(n).forEach(function(t){var e=o._decryptPayload(n[t]);i[t]=e})),t.abrupt("return",i);case 8:case"end":return t.stop()}},t,this)}));return function(e){return t.apply(this,arguments)}}()},{key:"toJSON",value:function(){return{bridgeUrl:this.bridgeUrl,sessionId:this.sessionId,symKey:this.symKey,dappName:this.dappName,protocol:this.protocol,expires:this.expires,accounts:this.accounts,uri:this.uri}}},{key:"randomId",value:function(){return(new Date).getTime()*Math.pow(10,3)+Math.floor(Math.random()*Math.pow(10,3))}},{key:"checkObject",value:function(t,e){var r=null,n=function(){throw new Error("".concat(e," object is invalid"))};if(t)if("object"===s(t))Object.keys(t).length&&(r=t);else if("string"==typeof t){try{t=JSON.parse(t)}catch(t){n()}Object.keys(t).length&&(r=t)}return r||n(),r}},{key:"formatPayload",value:function(t){var e=this.checkObject(t,"payload");return e.id&&delete e.id,c({id:this.randomId(),jsonrpc:"2.0",params:[]},e)}},{key:"promisifyListener",value:function(t){var e=this,r=t.fn,n=t.interval,i=t.timeout;return new Promise(function(t,o){var a=new f.a({fn:r,cb:function(e,r){e&&o(e),t(r)},interval:n,timeout:i});e.listeners.unshift(a)})}},{key:"stopLastListener",value:function(){return this.listeners.shift().stop(),!0}},{key:"isConnected",get:function(){return this._connected},set:function(t){if("boolean"!=typeof t)throw new Error("isConnected must be a boolean");this._connected=!!t}},{key:"bridgeUrl",get:function(){return this._bridgeUrl},set:function(t){t&&(this._bridgeUrl=t)}},{key:"symKey",get:function(){return this._symKey?this._symKey.toString("hex"):null},set:function(e){if(this.symKey||e){var r=t.from(e,"hex");this._symKey=r}}},{key:"sessionId",get:function(){return this._sessionId},set:function(t){t&&(this._sessionId=t)}},{key:"uri",get:function(){return this._formatWalletConnectURI()},set:function(t){if(t&&"string"==typeof t){var e=this._parseWalletConnectURI(t);this.protocol=e.protocol,this.bridgeUrl=e.bridgeUrl,this.sessionId=e.sessionId,this.symKey=e.symKey,this.dappName=e.dappName}}}]),e}()}).call(this,r(283).Buffer)},function(t,e,r){r(116),t.exports=r(282)},function(t,e,r){"use strict";(function(t){r(117),r(261),r(263),r(265),r(267),r(269),r(271),r(273),r(275),r(277),r(281),t._babelPolyfill&&"undefined"!=typeof console&&console.warn&&console.warn("@babel/polyfill is loaded more than once on this page. This is probably not desirable/intended and may have consequences if different versions of the polyfills are applied sequentially. If you do need to load the polyfill more than once, use @babel/polyfill/noConflict instead to bypass the warning."),t._babelPolyfill=!0}).call(this,r(84))},function(t,e,r){r(118),r(120),r(121),r(122),r(123),r(124),r(125),r(126),r(127),r(128),r(129),r(130),r(131),r(132),r(133),r(134),r(136),r(137),r(138),r(139),r(140),r(141),r(142),r(143),r(144),r(145),r(146),r(147),r(148),r(149),r(150),r(151),r(152),r(153),r(154),r(155),r(156),r(157),r(158),r(159),r(160),r(161),r(162),r(164),r(165),r(166),r(167),r(168),r(169),r(170),r(171),r(172),r(173),r(174),r(175),r(176),r(177),r(178),r(179),r(180),r(181),r(182),r(183),r(184),r(185),r(186),r(187),r(188),r(189),r(190),r(191),r(192),r(193),r(194),r(195),r(196),r(197),r(199),r(200),r(202),r(203),r(204),r(205),r(206),r(207),r(208),r(211),r(212),r(213),r(214),r(215),r(216),r(217),r(218),r(219),r(220),r(221),r(222),r(223),r(79),r(224),r(225),r(104),r(226),r(227),r(228),r(229),r(105),r(232),r(233),r(234),r(235),r(236),r(237),r(238),r(239),r(240),r(241),r(242),r(243),r(244),r(245),r(246),r(247),r(248),r(249),r(250),r(251),r(252),r(253),r(254),r(255),r(256),r(257),r(258),r(259),r(260),t.exports=r(8)},function(t,e,r){"use strict";var n=r(2),i=r(12),o=r(7),a=r(0),f=r(10),s=r(27).KEY,c=r(1),u=r(59),h=r(36),d=r(29),l=r(5),p=r(60),b=r(86),y=r(119),v=r(63),g=r(4),m=r(3),_=r(14),w=r(26),S=r(28),E=r(33),M=r(89),A=r(17),x=r(6),k=r(31),I=A.f,B=x.f,R=M.f,P=n.Symbol,T=n.JSON,L=T&&T.stringify,O=l("_hidden"),C=l("toPrimitive"),j={}.propertyIsEnumerable,N=u("symbol-registry"),D=u("symbols"),U=u("op-symbols"),q=Object.prototype,z="function"==typeof P,F=n.QObject,K=!F||!F.prototype||!F.prototype.findChild,Y=o&&c(function(){return 7!=E(B({},"a",{get:function(){return B(this,"a",{value:7}).a}})).a})?function(t,e,r){var n=I(q,e);n&&delete q[e],B(t,e,r),n&&t!==q&&B(q,e,n)}:B,V=function(t){var e=D[t]=E(P.prototype);return e._k=t,e},H=z&&"symbol"==typeof P.iterator?function(t){return"symbol"==typeof t}:function(t){return t instanceof P},W=function(t,e,r){return t===q&&W(U,e,r),g(t),e=w(e,!0),g(r),i(D,e)?(r.enumerable?(i(t,O)&&t[O][e]&&(t[O][e]=!1),r=E(r,{enumerable:S(0,!1)})):(i(t,O)||B(t,O,S(1,{})),t[O][e]=!0),Y(t,e,r)):B(t,e,r)},G=function(t,e){g(t);for(var r,n=y(e=_(e)),i=0,o=n.length;o>i;)W(t,r=n[i++],e[r]);return t},X=function(t){var e=j.call(this,t=w(t,!0));return!(this===q&&i(D,t)&&!i(U,t))&&(!(e||!i(this,t)||!i(D,t)||i(this,O)&&this[O][t])||e)},J=function(t,e){if(t=_(t),e=w(e,!0),t!==q||!i(D,e)||i(U,e)){var r=I(t,e);return!r||!i(D,e)||i(t,O)&&t[O][e]||(r.enumerable=!0),r}},Z=function(t){for(var e,r=R(_(t)),n=[],o=0;r.length>o;)i(D,e=r[o++])||e==O||e==s||n.push(e);return n},$=function(t){for(var e,r=t===q,n=R(r?U:_(t)),o=[],a=0;n.length>a;)!i(D,e=n[a++])||r&&!i(q,e)||o.push(D[e]);return o};z||(f((P=function(){if(this instanceof P)throw TypeError("Symbol is not a constructor!");var t=d(arguments.length>0?arguments[0]:void 0),e=function(r){this===q&&e.call(U,r),i(this,O)&&i(this[O],t)&&(this[O][t]=!1),Y(this,t,S(1,r))};return o&&K&&Y(q,t,{configurable:!0,set:e}),V(t)}).prototype,"toString",function(){return this._k}),A.f=J,x.f=W,r(34).f=M.f=Z,r(45).f=X,r(47).f=$,o&&!r(30)&&f(q,"propertyIsEnumerable",X,!0),p.f=function(t){return V(l(t))}),a(a.G+a.W+a.F*!z,{Symbol:P});for(var Q="hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables".split(","),tt=0;Q.length>tt;)l(Q[tt++]);for(var et=k(l.store),rt=0;et.length>rt;)b(et[rt++]);a(a.S+a.F*!z,"Symbol",{for:function(t){return i(N,t+="")?N[t]:N[t]=P(t)},keyFor:function(t){if(!H(t))throw TypeError(t+" is not a symbol!");for(var e in N)if(N[e]===t)return e},useSetter:function(){K=!0},useSimple:function(){K=!1}}),a(a.S+a.F*!z,"Object",{create:function(t,e){return void 0===e?E(t):G(E(t),e)},defineProperty:W,defineProperties:G,getOwnPropertyDescriptor:J,getOwnPropertyNames:Z,getOwnPropertySymbols:$}),T&&a(a.S+a.F*(!z||c(function(){var t=P();return"[null]"!=L([t])||"{}"!=L({a:t})||"{}"!=L(Object(t))})),"JSON",{stringify:function(t){for(var e,r,n=[t],i=1;arguments.length>i;)n.push(arguments[i++]);if(r=e=n[1],(m(e)||void 0!==t)&&!H(t))return v(e)||(e=function(t,e){if("function"==typeof r&&(e=r.call(this,t,e)),!H(e))return e}),n[1]=e,L.apply(T,n)}}),P.prototype[C]||r(13)(P.prototype,C,P.prototype.valueOf),h(P,"Symbol"),h(Math,"Math",!0),h(n.JSON,"JSON",!0)},function(t,e,r){var n=r(31),i=r(47),o=r(45);t.exports=function(t){var e=n(t),r=i.f;if(r)for(var a,f=r(t),s=o.f,c=0;f.length>c;)s.call(t,a=f[c++])&&e.push(a);return e}},function(t,e,r){var n=r(0);n(n.S,"Object",{create:r(33)})},function(t,e,r){var n=r(0);n(n.S+n.F*!r(7),"Object",{defineProperty:r(6).f})},function(t,e,r){var n=r(0);n(n.S+n.F*!r(7),"Object",{defineProperties:r(88)})},function(t,e,r){var n=r(14),i=r(17).f;r(18)("getOwnPropertyDescriptor",function(){return function(t,e){return i(n(t),e)}})},function(t,e,r){var n=r(15),i=r(35);r(18)("getPrototypeOf",function(){return function(t){return i(n(t))}})},function(t,e,r){var n=r(15),i=r(31);r(18)("keys",function(){return function(t){return i(n(t))}})},function(t,e,r){r(18)("getOwnPropertyNames",function(){return r(89).f})},function(t,e,r){var n=r(3),i=r(27).onFreeze;r(18)("freeze",function(t){return function(e){return t&&n(e)?t(i(e)):e}})},function(t,e,r){var n=r(3),i=r(27).onFreeze;r(18)("seal",function(t){return function(e){return t&&n(e)?t(i(e)):e}})},function(t,e,r){var n=r(3),i=r(27).onFreeze;r(18)("preventExtensions",function(t){return function(e){return t&&n(e)?t(i(e)):e}})},function(t,e,r){var n=r(3);r(18)("isFrozen",function(t){return function(e){return!n(e)||!!t&&t(e)}})},function(t,e,r){var n=r(3);r(18)("isSealed",function(t){return function(e){return!n(e)||!!t&&t(e)}})},function(t,e,r){var n=r(3);r(18)("isExtensible",function(t){return function(e){return!!n(e)&&(!t||t(e))}})},function(t,e,r){var n=r(0);n(n.S+n.F,"Object",{assign:r(90)})},function(t,e,r){var n=r(0);n(n.S,"Object",{is:r(135)})},function(t,e){t.exports=Object.is||function(t,e){return t===e?0!==t||1/t==1/e:t!=t&&e!=e}},function(t,e,r){var n=r(0);n(n.S,"Object",{setPrototypeOf:r(65).set})},function(t,e,r){"use strict";var n=r(48),i={};i[r(5)("toStringTag")]="z",i+""!="[object z]"&&r(10)(Object.prototype,"toString",function(){return"[object "+n(this)+"]"},!0)},function(t,e,r){var n=r(0);n(n.P,"Function",{bind:r(91)})},function(t,e,r){var n=r(6).f,i=Function.prototype,o=/^\s*function ([^ (]*)/;"name"in i||r(7)&&n(i,"name",{configurable:!0,get:function(){try{return(""+this).match(o)[1]}catch(t){return""}}})},function(t,e,r){"use strict";var n=r(3),i=r(35),o=r(5)("hasInstance"),a=Function.prototype;o in a||r(6).f(a,o,{value:function(t){if("function"!=typeof this||!n(t))return!1;if(!n(this.prototype))return t instanceof this;for(;t=i(t);)if(this.prototype===t)return!0;return!1}})},function(t,e,r){var n=r(0),i=r(93);n(n.G+n.F*(parseInt!=i),{parseInt:i})},function(t,e,r){var n=r(0),i=r(94);n(n.G+n.F*(parseFloat!=i),{parseFloat:i})},function(t,e,r){"use strict";var n=r(2),i=r(12),o=r(22),a=r(67),f=r(26),s=r(1),c=r(34).f,u=r(17).f,h=r(6).f,d=r(49).trim,l=n.Number,p=l,b=l.prototype,y="Number"==o(r(33)(b)),v="trim"in String.prototype,g=function(t){var e=f(t,!1);if("string"==typeof e&&e.length>2){var r,n,i,o=(e=v?e.trim():d(e,3)).charCodeAt(0);if(43===o||45===o){if(88===(r=e.charCodeAt(2))||120===r)return NaN}else if(48===o){switch(e.charCodeAt(1)){case 66:case 98:n=2,i=49;break;case 79:case 111:n=8,i=55;break;default:return+e}for(var a,s=e.slice(2),c=0,u=s.length;c<u;c++)if((a=s.charCodeAt(c))<48||a>i)return NaN;return parseInt(s,n)}}return+e};if(!l(" 0o1")||!l("0b1")||l("+0x1")){l=function(t){var e=arguments.length<1?0:t,r=this;return r instanceof l&&(y?s(function(){b.valueOf.call(r)}):"Number"!=o(r))?a(new p(g(e)),r,l):g(e)};for(var m,_=r(7)?c(p):"MAX_VALUE,MIN_VALUE,NaN,NEGATIVE_INFINITY,POSITIVE_INFINITY,EPSILON,isFinite,isInteger,isNaN,isSafeInteger,MAX_SAFE_INTEGER,MIN_SAFE_INTEGER,parseFloat,parseInt,isInteger".split(","),w=0;_.length>w;w++)i(p,m=_[w])&&!i(l,m)&&h(l,m,u(p,m));l.prototype=b,b.constructor=l,r(10)(n,"Number",l)}},function(t,e,r){"use strict";var n=r(0),i=r(24),o=r(95),a=r(68),f=1..toFixed,s=Math.floor,c=[0,0,0,0,0,0],u="Number.toFixed: incorrect invocation!",h=function(t,e){for(var r=-1,n=e;++r<6;)n+=t*c[r],c[r]=n%1e7,n=s(n/1e7)},d=function(t){for(var e=6,r=0;--e>=0;)r+=c[e],c[e]=s(r/t),r=r%t*1e7},l=function(){for(var t=6,e="";--t>=0;)if(""!==e||0===t||0!==c[t]){var r=String(c[t]);e=""===e?r:e+a.call("0",7-r.length)+r}return e},p=function(t,e,r){return 0===e?r:e%2==1?p(t,e-1,r*t):p(t*t,e/2,r)};n(n.P+n.F*(!!f&&("0.000"!==8e-5.toFixed(3)||"1"!==.9.toFixed(0)||"1.25"!==1.255.toFixed(2)||"1000000000000000128"!==(0xde0b6b3a7640080).toFixed(0))||!r(1)(function(){f.call({})})),"Number",{toFixed:function(t){var e,r,n,f,s=o(this,u),c=i(t),b="",y="0";if(c<0||c>20)throw RangeError(u);if(s!=s)return"NaN";if(s<=-1e21||s>=1e21)return String(s);if(s<0&&(b="-",s=-s),s>1e-21)if(r=(e=function(t){for(var e=0,r=s*p(2,69,1);r>=4096;)e+=12,r/=4096;for(;r>=2;)e+=1,r/=2;return e}()-69)<0?s*p(2,-e,1):s/p(2,e,1),r*=4503599627370496,(e=52-e)>0){for(h(0,r),n=c;n>=7;)h(1e7,0),n-=7;for(h(p(10,n,1),0),n=e-1;n>=23;)d(1<<23),n-=23;d(1<<n),h(1,1),d(2),y=l()}else h(0,r),h(1<<-e,0),y=l()+a.call("0",c);return c>0?b+((f=y.length)<=c?"0."+a.call("0",c-f)+y:y.slice(0,f-c)+"."+y.slice(f-c)):b+y}})},function(t,e,r){"use strict";var n=r(0),i=r(1),o=r(95),a=1..toPrecision;n(n.P+n.F*(i(function(){return"1"!==a.call(1,void 0)})||!i(function(){a.call({})})),"Number",{toPrecision:function(t){var e=o(this,"Number#toPrecision: incorrect invocation!");return void 0===t?a.call(e):a.call(e,t)}})},function(t,e,r){var n=r(0);n(n.S,"Number",{EPSILON:Math.pow(2,-52)})},function(t,e,r){var n=r(0),i=r(2).isFinite;n(n.S,"Number",{isFinite:function(t){return"number"==typeof t&&i(t)}})},function(t,e,r){var n=r(0);n(n.S,"Number",{isInteger:r(96)})},function(t,e,r){var n=r(0);n(n.S,"Number",{isNaN:function(t){return t!=t}})},function(t,e,r){var n=r(0),i=r(96),o=Math.abs;n(n.S,"Number",{isSafeInteger:function(t){return i(t)&&o(t)<=9007199254740991}})},function(t,e,r){var n=r(0);n(n.S,"Number",{MAX_SAFE_INTEGER:9007199254740991})},function(t,e,r){var n=r(0);n(n.S,"Number",{MIN_SAFE_INTEGER:-9007199254740991})},function(t,e,r){var n=r(0),i=r(94);n(n.S+n.F*(Number.parseFloat!=i),"Number",{parseFloat:i})},function(t,e,r){var n=r(0),i=r(93);n(n.S+n.F*(Number.parseInt!=i),"Number",{parseInt:i})},function(t,e,r){var n=r(0),i=r(97),o=Math.sqrt,a=Math.acosh;n(n.S+n.F*!(a&&710==Math.floor(a(Number.MAX_VALUE))&&a(1/0)==1/0),"Math",{acosh:function(t){return(t=+t)<1?NaN:t>94906265.62425156?Math.log(t)+Math.LN2:i(t-1+o(t-1)*o(t+1))}})},function(t,e,r){var n=r(0),i=Math.asinh;n(n.S+n.F*!(i&&1/i(0)>0),"Math",{asinh:function t(e){return isFinite(e=+e)&&0!=e?e<0?-t(-e):Math.log(e+Math.sqrt(e*e+1)):e}})},function(t,e,r){var n=r(0),i=Math.atanh;n(n.S+n.F*!(i&&1/i(-0)<0),"Math",{atanh:function(t){return 0==(t=+t)?t:Math.log((1+t)/(1-t))/2}})},function(t,e,r){var n=r(0),i=r(69);n(n.S,"Math",{cbrt:function(t){return i(t=+t)*Math.pow(Math.abs(t),1/3)}})},function(t,e,r){var n=r(0);n(n.S,"Math",{clz32:function(t){return(t>>>=0)?31-Math.floor(Math.log(t+.5)*Math.LOG2E):32}})},function(t,e,r){var n=r(0),i=Math.exp;n(n.S,"Math",{cosh:function(t){return(i(t=+t)+i(-t))/2}})},function(t,e,r){var n=r(0),i=r(70);n(n.S+n.F*(i!=Math.expm1),"Math",{expm1:i})},function(t,e,r){var n=r(0);n(n.S,"Math",{fround:r(163)})},function(t,e,r){var n=r(69),i=Math.pow,o=i(2,-52),a=i(2,-23),f=i(2,127)*(2-a),s=i(2,-126);t.exports=Math.fround||function(t){var e,r,i=Math.abs(t),c=n(t);return i<s?c*(i/s/a+1/o-1/o)*s*a:(r=(e=(1+a/o)*i)-(e-i))>f||r!=r?c*(1/0):c*r}},function(t,e,r){var n=r(0),i=Math.abs;n(n.S,"Math",{hypot:function(t,e){for(var r,n,o=0,a=0,f=arguments.length,s=0;a<f;)s<(r=i(arguments[a++]))?(o=o*(n=s/r)*n+1,s=r):o+=r>0?(n=r/s)*n:r;return s===1/0?1/0:s*Math.sqrt(o)}})},function(t,e,r){var n=r(0),i=Math.imul;n(n.S+n.F*r(1)(function(){return-5!=i(4294967295,5)||2!=i.length}),"Math",{imul:function(t,e){var r=+t,n=+e,i=65535&r,o=65535&n;return 0|i*o+((65535&r>>>16)*o+i*(65535&n>>>16)<<16>>>0)}})},function(t,e,r){var n=r(0);n(n.S,"Math",{log10:function(t){return Math.log(t)*Math.LOG10E}})},function(t,e,r){var n=r(0);n(n.S,"Math",{log1p:r(97)})},function(t,e,r){var n=r(0);n(n.S,"Math",{log2:function(t){return Math.log(t)/Math.LN2}})},function(t,e,r){var n=r(0);n(n.S,"Math",{sign:r(69)})},function(t,e,r){var n=r(0),i=r(70),o=Math.exp;n(n.S+n.F*r(1)(function(){return-2e-17!=!Math.sinh(-2e-17)}),"Math",{sinh:function(t){return Math.abs(t=+t)<1?(i(t)-i(-t))/2:(o(t-1)-o(-t-1))*(Math.E/2)}})},function(t,e,r){var n=r(0),i=r(70),o=Math.exp;n(n.S,"Math",{tanh:function(t){var e=i(t=+t),r=i(-t);return e==1/0?1:r==1/0?-1:(e-r)/(o(t)+o(-t))}})},function(t,e,r){var n=r(0);n(n.S,"Math",{trunc:function(t){return(t>0?Math.floor:Math.ceil)(t)}})},function(t,e,r){var n=r(0),i=r(32),o=String.fromCharCode,a=String.fromCodePoint;n(n.S+n.F*(!!a&&1!=a.length),"String",{fromCodePoint:function(t){for(var e,r=[],n=arguments.length,a=0;n>a;){if(e=+arguments[a++],i(e,1114111)!==e)throw RangeError(e+" is not a valid code point");r.push(e<65536?o(e):o(55296+((e-=65536)>>10),e%1024+56320))}return r.join("")}})},function(t,e,r){var n=r(0),i=r(14),o=r(9);n(n.S,"String",{raw:function(t){for(var e=i(t.raw),r=o(e.length),n=arguments.length,a=[],f=0;r>f;)a.push(String(e[f++])),f<n&&a.push(String(arguments[f]));return a.join("")}})},function(t,e,r){"use strict";r(49)("trim",function(t){return function(){return t(this,3)}})},function(t,e,r){"use strict";var n=r(98)(!0);r(71)(String,"String",function(t){this._t=String(t),this._i=0},function(){var t,e=this._t,r=this._i;return r>=e.length?{value:void 0,done:!0}:(t=n(e,r),this._i+=t.length,{value:t,done:!1})})},function(t,e,r){"use strict";var n=r(0),i=r(98)(!1);n(n.P,"String",{codePointAt:function(t){return i(this,t)}})},function(t,e,r){"use strict";var n=r(0),i=r(9),o=r(72),a="".endsWith;n(n.P+n.F*r(74)("endsWith"),"String",{endsWith:function(t){var e=o(this,t,"endsWith"),r=arguments.length>1?arguments[1]:void 0,n=i(e.length),f=void 0===r?n:Math.min(i(r),n),s=String(t);return a?a.call(e,s,f):e.slice(f-s.length,f)===s}})},function(t,e,r){"use strict";var n=r(0),i=r(72);n(n.P+n.F*r(74)("includes"),"String",{includes:function(t){return!!~i(this,t,"includes").indexOf(t,arguments.length>1?arguments[1]:void 0)}})},function(t,e,r){var n=r(0);n(n.P,"String",{repeat:r(68)})},function(t,e,r){"use strict";var n=r(0),i=r(9),o=r(72),a="".startsWith;n(n.P+n.F*r(74)("startsWith"),"String",{startsWith:function(t){var e=o(this,t,"startsWith"),r=i(Math.min(arguments.length>1?arguments[1]:void 0,e.length)),n=String(t);return a?a.call(e,n,r):e.slice(r,r+n.length)===n}})},function(t,e,r){"use strict";r(11)("anchor",function(t){return function(e){return t(this,"a","name",e)}})},function(t,e,r){"use strict";r(11)("big",function(t){return function(){return t(this,"big","","")}})},function(t,e,r){"use strict";r(11)("blink",function(t){return function(){return t(this,"blink","","")}})},function(t,e,r){"use strict";r(11)("bold",function(t){return function(){return t(this,"b","","")}})},function(t,e,r){"use strict";r(11)("fixed",function(t){return function(){return t(this,"tt","","")}})},function(t,e,r){"use strict";r(11)("fontcolor",function(t){return function(e){return t(this,"font","color",e)}})},function(t,e,r){"use strict";r(11)("fontsize",function(t){return function(e){return t(this,"font","size",e)}})},function(t,e,r){"use strict";r(11)("italics",function(t){return function(){return t(this,"i","","")}})},function(t,e,r){"use strict";r(11)("link",function(t){return function(e){return t(this,"a","href",e)}})},function(t,e,r){"use strict";r(11)("small",function(t){return function(){return t(this,"small","","")}})},function(t,e,r){"use strict";r(11)("strike",function(t){return function(){return t(this,"strike","","")}})},function(t,e,r){"use strict";r(11)("sub",function(t){return function(){return t(this,"sub","","")}})},function(t,e,r){"use strict";r(11)("sup",function(t){return function(){return t(this,"sup","","")}})},function(t,e,r){var n=r(0);n(n.S,"Date",{now:function(){return(new Date).getTime()}})},function(t,e,r){"use strict";var n=r(0),i=r(15),o=r(26);n(n.P+n.F*r(1)(function(){return null!==new Date(NaN).toJSON()||1!==Date.prototype.toJSON.call({toISOString:function(){return 1}})}),"Date",{toJSON:function(t){var e=i(this),r=o(e);return"number"!=typeof r||isFinite(r)?e.toISOString():null}})},function(t,e,r){var n=r(0),i=r(198);n(n.P+n.F*(Date.prototype.toISOString!==i),"Date",{toISOString:i})},function(t,e,r){"use strict";var n=r(1),i=Date.prototype.getTime,o=Date.prototype.toISOString,a=function(t){return t>9?t:"0"+t};t.exports=n(function(){return"0385-07-25T07:06:39.999Z"!=o.call(new Date(-5e13-1))})||!n(function(){o.call(new Date(NaN))})?function(){if(!isFinite(i.call(this)))throw RangeError("Invalid time value");var t=this,e=t.getUTCFullYear(),r=t.getUTCMilliseconds(),n=e<0?"-":e>9999?"+":"";return n+("00000"+Math.abs(e)).slice(n?-6:-4)+"-"+a(t.getUTCMonth()+1)+"-"+a(t.getUTCDate())+"T"+a(t.getUTCHours())+":"+a(t.getUTCMinutes())+":"+a(t.getUTCSeconds())+"."+(r>99?r:"0"+a(r))+"Z"}:o},function(t,e,r){var n=Date.prototype,i=n.toString,o=n.getTime;new Date(NaN)+""!="Invalid Date"&&r(10)(n,"toString",function(){var t=o.call(this);return t==t?i.call(this):"Invalid Date"})},function(t,e,r){var n=r(5)("toPrimitive"),i=Date.prototype;n in i||r(13)(i,n,r(201))},function(t,e,r){"use strict";var n=r(4),i=r(26);t.exports=function(t){if("string"!==t&&"number"!==t&&"default"!==t)throw TypeError("Incorrect hint");return i(n(this),"number"!=t)}},function(t,e,r){var n=r(0);n(n.S,"Array",{isArray:r(63)})},function(t,e,r){"use strict";var n=r(20),i=r(0),o=r(15),a=r(100),f=r(75),s=r(9),c=r(76),u=r(77);i(i.S+i.F*!r(50)(function(t){Array.from(t)}),"Array",{from:function(t){var e,r,i,h,d=o(t),l="function"==typeof this?this:Array,p=arguments.length,b=p>1?arguments[1]:void 0,y=void 0!==b,v=0,g=u(d);if(y&&(b=n(b,p>2?arguments[2]:void 0,2)),void 0==g||l==Array&&f(g))for(r=new l(e=s(d.length));e>v;v++)c(r,v,y?b(d[v],v):d[v]);else for(h=g.call(d),r=new l;!(i=h.next()).done;v++)c(r,v,y?a(h,b,[i.value,v],!0):i.value);return r.length=v,r}})},function(t,e,r){"use strict";var n=r(0),i=r(76);n(n.S+n.F*r(1)(function(){function t(){}return!(Array.of.call(t)instanceof t)}),"Array",{of:function(){for(var t=0,e=arguments.length,r=new("function"==typeof this?this:Array)(e);e>t;)i(r,t,arguments[t++]);return r.length=e,r}})},function(t,e,r){"use strict";var n=r(0),i=r(14),o=[].join;n(n.P+n.F*(r(44)!=Object||!r(16)(o)),"Array",{join:function(t){return o.call(i(this),void 0===t?",":t)}})},function(t,e,r){"use strict";var n=r(0),i=r(64),o=r(22),a=r(32),f=r(9),s=[].slice;n(n.P+n.F*r(1)(function(){i&&s.call(i)}),"Array",{slice:function(t,e){var r=f(this.length),n=o(this);if(e=void 0===e?r:e,"Array"==n)return s.call(this,t,e);for(var i=a(t,r),c=a(e,r),u=f(c-i),h=new Array(u),d=0;d<u;d++)h[d]="String"==n?this.charAt(i+d):this[i+d];return h}})},function(t,e,r){"use strict";var n=r(0),i=r(21),o=r(15),a=r(1),f=[].sort,s=[1,2,3];n(n.P+n.F*(a(function(){s.sort(void 0)})||!a(function(){s.sort(null)})||!r(16)(f)),"Array",{sort:function(t){return void 0===t?f.call(o(this)):f.call(o(this),i(t))}})},function(t,e,r){"use strict";var n=r(0),i=r(19)(0),o=r(16)([].forEach,!0);n(n.P+n.F*!o,"Array",{forEach:function(t){return i(this,t,arguments[1])}})},function(t,e,r){var n=r(210);t.exports=function(t,e){return new(n(t))(e)}},function(t,e,r){var n=r(3),i=r(63),o=r(5)("species");t.exports=function(t){var e;return i(t)&&("function"!=typeof(e=t.constructor)||e!==Array&&!i(e.prototype)||(e=void 0),n(e)&&null===(e=e[o])&&(e=void 0)),void 0===e?Array:e}},function(t,e,r){"use strict";var n=r(0),i=r(19)(1);n(n.P+n.F*!r(16)([].map,!0),"Array",{map:function(t){return i(this,t,arguments[1])}})},function(t,e,r){"use strict";var n=r(0),i=r(19)(2);n(n.P+n.F*!r(16)([].filter,!0),"Array",{filter:function(t){return i(this,t,arguments[1])}})},function(t,e,r){"use strict";var n=r(0),i=r(19)(3);n(n.P+n.F*!r(16)([].some,!0),"Array",{some:function(t){return i(this,t,arguments[1])}})},function(t,e,r){"use strict";var n=r(0),i=r(19)(4);n(n.P+n.F*!r(16)([].every,!0),"Array",{every:function(t){return i(this,t,arguments[1])}})},function(t,e,r){"use strict";var n=r(0),i=r(101);n(n.P+n.F*!r(16)([].reduce,!0),"Array",{reduce:function(t){return i(this,t,arguments.length,arguments[1],!1)}})},function(t,e,r){"use strict";var n=r(0),i=r(101);n(n.P+n.F*!r(16)([].reduceRight,!0),"Array",{reduceRight:function(t){return i(this,t,arguments.length,arguments[1],!0)}})},function(t,e,r){"use strict";var n=r(0),i=r(46)(!1),o=[].indexOf,a=!!o&&1/[1].indexOf(1,-0)<0;n(n.P+n.F*(a||!r(16)(o)),"Array",{indexOf:function(t){return a?o.apply(this,arguments)||0:i(this,t,arguments[1])}})},function(t,e,r){"use strict";var n=r(0),i=r(14),o=r(24),a=r(9),f=[].lastIndexOf,s=!!f&&1/[1].lastIndexOf(1,-0)<0;n(n.P+n.F*(s||!r(16)(f)),"Array",{lastIndexOf:function(t){if(s)return f.apply(this,arguments)||0;var e=i(this),r=a(e.length),n=r-1;for(arguments.length>1&&(n=Math.min(n,o(arguments[1]))),n<0&&(n=r+n);n>=0;n--)if(n in e&&e[n]===t)return n||0;return-1}})},function(t,e,r){var n=r(0);n(n.P,"Array",{copyWithin:r(102)}),r(38)("copyWithin")},function(t,e,r){var n=r(0);n(n.P,"Array",{fill:r(78)}),r(38)("fill")},function(t,e,r){"use strict";var n=r(0),i=r(19)(5),o=!0;"find"in[]&&Array(1).find(function(){o=!1}),n(n.P+n.F*o,"Array",{find:function(t){return i(this,t,arguments.length>1?arguments[1]:void 0)}}),r(38)("find")},function(t,e,r){"use strict";var n=r(0),i=r(19)(6),o="findIndex",a=!0;o in[]&&Array(1)[o](function(){a=!1}),n(n.P+n.F*a,"Array",{findIndex:function(t){return i(this,t,arguments.length>1?arguments[1]:void 0)}}),r(38)(o)},function(t,e,r){r(39)("Array")},function(t,e,r){var n=r(2),i=r(67),o=r(6).f,a=r(34).f,f=r(73),s=r(80),c=n.RegExp,u=c,h=c.prototype,d=/a/g,l=/a/g,p=new c(d)!==d;if(r(7)&&(!p||r(1)(function(){return l[r(5)("match")]=!1,c(d)!=d||c(l)==l||"/a/i"!=c(d,"i")}))){c=function(t,e){var r=this instanceof c,n=f(t),o=void 0===e;return!r&&n&&t.constructor===c&&o?t:i(p?new u(n&&!o?t.source:t,e):u((n=t instanceof c)?t.source:t,n&&o?s.call(t):e),r?this:h,c)};for(var b=function(t){t in c||o(c,t,{configurable:!0,get:function(){return u[t]},set:function(e){u[t]=e}})},y=a(u),v=0;y.length>v;)b(y[v++]);h.constructor=c,c.prototype=h,r(10)(n,"RegExp",c)}r(39)("RegExp")},function(t,e,r){"use strict";r(104);var n=r(4),i=r(80),o=r(7),a=/./.toString,f=function(t){r(10)(RegExp.prototype,"toString",t,!0)};r(1)(function(){return"/a/b"!=a.call({source:"a",flags:"b"})})?f(function(){var t=n(this);return"/".concat(t.source,"/","flags"in t?t.flags:!o&&t instanceof RegExp?i.call(t):void 0)}):"toString"!=a.name&&f(function(){return a.call(this)})},function(t,e,r){r(51)("match",1,function(t,e,r){return[function(r){"use strict";var n=t(this),i=void 0==r?void 0:r[e];return void 0!==i?i.call(r,n):new RegExp(r)[e](String(n))},r]})},function(t,e,r){r(51)("replace",2,function(t,e,r){return[function(n,i){"use strict";var o=t(this),a=void 0==n?void 0:n[e];return void 0!==a?a.call(n,o,i):r.call(String(o),n,i)},r]})},function(t,e,r){r(51)("search",1,function(t,e,r){return[function(r){"use strict";var n=t(this),i=void 0==r?void 0:r[e];return void 0!==i?i.call(r,n):new RegExp(r)[e](String(n))},r]})},function(t,e,r){r(51)("split",2,function(t,e,n){"use strict";var i=r(73),o=n,a=[].push;if("c"=="abbc".split(/(b)*/)[1]||4!="test".split(/(?:)/,-1).length||2!="ab".split(/(?:ab)*/).length||4!=".".split(/(.?)(.?)/).length||".".split(/()()/).length>1||"".split(/.?/).length){var f=void 0===/()??/.exec("")[1];n=function(t,e){var r=String(this);if(void 0===t&&0===e)return[];if(!i(t))return o.call(r,t,e);var n,s,c,u,h,d=[],l=(t.ignoreCase?"i":"")+(t.multiline?"m":"")+(t.unicode?"u":"")+(t.sticky?"y":""),p=0,b=void 0===e?4294967295:e>>>0,y=new RegExp(t.source,l+"g");for(f||(n=new RegExp("^"+y.source+"$(?!\\s)",l));(s=y.exec(r))&&!((c=s.index+s[0].length)>p&&(d.push(r.slice(p,s.index)),!f&&s.length>1&&s[0].replace(n,function(){for(h=1;h<arguments.length-2;h++)void 0===arguments[h]&&(s[h]=void 0)}),s.length>1&&s.index<r.length&&a.apply(d,s.slice(1)),u=s[0].length,p=c,d.length>=b));)y.lastIndex===s.index&&y.lastIndex++;return p===r.length?!u&&y.test("")||d.push(""):d.push(r.slice(p)),d.length>b?d.slice(0,b):d}}else"0".split(void 0,0).length&&(n=function(t,e){return void 0===t&&0===e?[]:o.call(this,t,e)});return[function(r,i){var o=t(this),a=void 0==r?void 0:r[e];return void 0!==a?a.call(r,o,i):n.call(String(o),r,i)},n]})},function(t,e,r){var n=r(2),i=r(81).set,o=n.MutationObserver||n.WebKitMutationObserver,a=n.process,f=n.Promise,s="process"==r(22)(a);t.exports=function(){var t,e,r,c=function(){var n,i;for(s&&(n=a.domain)&&n.exit();t;){i=t.fn,t=t.next;try{i()}catch(n){throw t?r():e=void 0,n}}e=void 0,n&&n.enter()};if(s)r=function(){a.nextTick(c)};else if(!o||n.navigator&&n.navigator.standalone)if(f&&f.resolve){var u=f.resolve(void 0);r=function(){u.then(c)}}else r=function(){i.call(n,c)};else{var h=!0,d=document.createTextNode("");new o(c).observe(d,{characterData:!0}),r=function(){d.data=h=!h}}return function(n){var i={fn:n,next:void 0};e&&(e.next=i),t||(t=i,r()),e=i}}},function(t,e){t.exports=function(t){try{return{e:!1,v:t()}}catch(t){return{e:!0,v:t}}}},function(t,e,r){"use strict";var n=r(108),i=r(42);t.exports=r(55)("Map",function(t){return function(){return t(this,arguments.length>0?arguments[0]:void 0)}},{get:function(t){var e=n.getEntry(i(this,"Map"),t);return e&&e.v},set:function(t,e){return n.def(i(this,"Map"),0===t?0:t,e)}},n,!0)},function(t,e,r){"use strict";var n=r(108),i=r(42);t.exports=r(55)("Set",function(t){return function(){return t(this,arguments.length>0?arguments[0]:void 0)}},{add:function(t){return n.def(i(this,"Set"),t=0===t?0:t,t)}},n)},function(t,e,r){"use strict";var n,i=r(19)(0),o=r(10),a=r(27),f=r(90),s=r(109),c=r(3),u=r(1),h=r(42),d=a.getWeak,l=Object.isExtensible,p=s.ufstore,b={},y=function(t){return function(){return t(this,arguments.length>0?arguments[0]:void 0)}},v={get:function(t){if(c(t)){var e=d(t);return!0===e?p(h(this,"WeakMap")).get(t):e?e[this._i]:void 0}},set:function(t,e){return s.def(h(this,"WeakMap"),t,e)}},g=t.exports=r(55)("WeakMap",y,v,s,!0,!0);u(function(){return 7!=(new g).set((Object.freeze||Object)(b),7).get(b)})&&(f((n=s.getConstructor(y,"WeakMap")).prototype,v),a.NEED=!0,i(["delete","has","get","set"],function(t){var e=g.prototype,r=e[t];o(e,t,function(e,i){if(c(e)&&!l(e)){this._f||(this._f=new n);var o=this._f[t](e,i);return"set"==t?this:o}return r.call(this,e,i)})}))},function(t,e,r){"use strict";var n=r(109),i=r(42);r(55)("WeakSet",function(t){return function(){return t(this,arguments.length>0?arguments[0]:void 0)}},{add:function(t){return n.def(i(this,"WeakSet"),t,!0)}},n,!1,!0)},function(t,e,r){"use strict";var n=r(0),i=r(56),o=r(82),a=r(4),f=r(32),s=r(9),c=r(3),u=r(2).ArrayBuffer,h=r(53),d=o.ArrayBuffer,l=o.DataView,p=i.ABV&&u.isView,b=d.prototype.slice,y=i.VIEW;n(n.G+n.W+n.F*(u!==d),{ArrayBuffer:d}),n(n.S+n.F*!i.CONSTR,"ArrayBuffer",{isView:function(t){return p&&p(t)||c(t)&&y in t}}),n(n.P+n.U+n.F*r(1)(function(){return!new d(2).slice(1,void 0).byteLength}),"ArrayBuffer",{slice:function(t,e){if(void 0!==b&&void 0===e)return b.call(a(this),t);for(var r=a(this).byteLength,n=f(t,r),i=f(void 0===e?r:e,r),o=new(h(this,d))(s(i-n)),c=new l(this),u=new l(o),p=0;n<i;)u.setUint8(p++,c.getUint8(n++));return o}}),r(39)("ArrayBuffer")},function(t,e,r){var n=r(0);n(n.G+n.W+n.F*!r(56).ABV,{DataView:r(82).DataView})},function(t,e,r){r(25)("Int8",1,function(t){return function(e,r,n){return t(this,e,r,n)}})},function(t,e,r){r(25)("Uint8",1,function(t){return function(e,r,n){return t(this,e,r,n)}})},function(t,e,r){r(25)("Uint8",1,function(t){return function(e,r,n){return t(this,e,r,n)}},!0)},function(t,e,r){r(25)("Int16",2,function(t){return function(e,r,n){return t(this,e,r,n)}})},function(t,e,r){r(25)("Uint16",2,function(t){return function(e,r,n){return t(this,e,r,n)}})},function(t,e,r){r(25)("Int32",4,function(t){return function(e,r,n){return t(this,e,r,n)}})},function(t,e,r){r(25)("Uint32",4,function(t){return function(e,r,n){return t(this,e,r,n)}})},function(t,e,r){r(25)("Float32",4,function(t){return function(e,r,n){return t(this,e,r,n)}})},function(t,e,r){r(25)("Float64",8,function(t){return function(e,r,n){return t(this,e,r,n)}})},function(t,e,r){var n=r(0),i=r(21),o=r(4),a=(r(2).Reflect||{}).apply,f=Function.apply;n(n.S+n.F*!r(1)(function(){a(function(){})}),"Reflect",{apply:function(t,e,r){var n=i(t),s=o(r);return a?a(n,e,s):f.call(n,e,s)}})},function(t,e,r){var n=r(0),i=r(33),o=r(21),a=r(4),f=r(3),s=r(1),c=r(91),u=(r(2).Reflect||{}).construct,h=s(function(){function t(){}return!(u(function(){},[],t)instanceof t)}),d=!s(function(){u(function(){})});n(n.S+n.F*(h||d),"Reflect",{construct:function(t,e){o(t),a(e);var r=arguments.length<3?t:o(arguments[2]);if(d&&!h)return u(t,e,r);if(t==r){switch(e.length){case 0:return new t;case 1:return new t(e[0]);case 2:return new t(e[0],e[1]);case 3:return new t(e[0],e[1],e[2]);case 4:return new t(e[0],e[1],e[2],e[3])}var n=[null];return n.push.apply(n,e),new(c.apply(t,n))}var s=r.prototype,l=i(f(s)?s:Object.prototype),p=Function.apply.call(t,l,e);return f(p)?p:l}})},function(t,e,r){var n=r(6),i=r(0),o=r(4),a=r(26);i(i.S+i.F*r(1)(function(){Reflect.defineProperty(n.f({},1,{value:1}),1,{value:2})}),"Reflect",{defineProperty:function(t,e,r){o(t),e=a(e,!0),o(r);try{return n.f(t,e,r),!0}catch(t){return!1}}})},function(t,e,r){var n=r(0),i=r(17).f,o=r(4);n(n.S,"Reflect",{deleteProperty:function(t,e){var r=i(o(t),e);return!(r&&!r.configurable)&&delete t[e]}})},function(t,e,r){"use strict";var n=r(0),i=r(4),o=function(t){this._t=i(t),this._i=0;var e,r=this._k=[];for(e in t)r.push(e)};r(99)(o,"Object",function(){var t,e=this._k;do{if(this._i>=e.length)return{value:void 0,done:!0}}while(!((t=e[this._i++])in this._t));return{value:t,done:!1}}),n(n.S,"Reflect",{enumerate:function(t){return new o(t)}})},function(t,e,r){var n=r(17),i=r(35),o=r(12),a=r(0),f=r(3),s=r(4);a(a.S,"Reflect",{get:function t(e,r){var a,c,u=arguments.length<3?e:arguments[2];return s(e)===u?e[r]:(a=n.f(e,r))?o(a,"value")?a.value:void 0!==a.get?a.get.call(u):void 0:f(c=i(e))?t(c,r,u):void 0}})},function(t,e,r){var n=r(17),i=r(0),o=r(4);i(i.S,"Reflect",{getOwnPropertyDescriptor:function(t,e){return n.f(o(t),e)}})},function(t,e,r){var n=r(0),i=r(35),o=r(4);n(n.S,"Reflect",{getPrototypeOf:function(t){return i(o(t))}})},function(t,e,r){var n=r(0);n(n.S,"Reflect",{has:function(t,e){return e in t}})},function(t,e,r){var n=r(0),i=r(4),o=Object.isExtensible;n(n.S,"Reflect",{isExtensible:function(t){return i(t),!o||o(t)}})},function(t,e,r){var n=r(0);n(n.S,"Reflect",{ownKeys:r(111)})},function(t,e,r){var n=r(0),i=r(4),o=Object.preventExtensions;n(n.S,"Reflect",{preventExtensions:function(t){i(t);try{return o&&o(t),!0}catch(t){return!1}}})},function(t,e,r){var n=r(6),i=r(17),o=r(35),a=r(12),f=r(0),s=r(28),c=r(4),u=r(3);f(f.S,"Reflect",{set:function t(e,r,f){var h,d,l=arguments.length<4?e:arguments[3],p=i.f(c(e),r);if(!p){if(u(d=o(e)))return t(d,r,f,l);p=s(0)}if(a(p,"value")){if(!1===p.writable||!u(l))return!1;if(h=i.f(l,r)){if(h.get||h.set||!1===h.writable)return!1;h.value=f,n.f(l,r,h)}else n.f(l,r,s(0,f));return!0}return void 0!==p.set&&(p.set.call(l,f),!0)}})},function(t,e,r){var n=r(0),i=r(65);i&&n(n.S,"Reflect",{setPrototypeOf:function(t,e){i.check(t,e);try{return i.set(t,e),!0}catch(t){return!1}}})},function(t,e,r){r(262),t.exports=r(8).Array.includes},function(t,e,r){"use strict";var n=r(0),i=r(46)(!0);n(n.P,"Array",{includes:function(t){return i(this,t,arguments.length>1?arguments[1]:void 0)}}),r(38)("includes")},function(t,e,r){r(264),t.exports=r(8).String.padStart},function(t,e,r){"use strict";var n=r(0),i=r(112),o=r(54);n(n.P+n.F*/Version\/10\.\d+(\.\d+)? Safari\//.test(o),"String",{padStart:function(t){return i(this,t,arguments.length>1?arguments[1]:void 0,!0)}})},function(t,e,r){r(266),t.exports=r(8).String.padEnd},function(t,e,r){"use strict";var n=r(0),i=r(112),o=r(54);n(n.P+n.F*/Version\/10\.\d+(\.\d+)? Safari\//.test(o),"String",{padEnd:function(t){return i(this,t,arguments.length>1?arguments[1]:void 0,!1)}})},function(t,e,r){r(268),t.exports=r(60).f("asyncIterator")},function(t,e,r){r(86)("asyncIterator")},function(t,e,r){r(270),t.exports=r(8).Object.getOwnPropertyDescriptors},function(t,e,r){var n=r(0),i=r(111),o=r(14),a=r(17),f=r(76);n(n.S,"Object",{getOwnPropertyDescriptors:function(t){for(var e,r,n=o(t),s=a.f,c=i(n),u={},h=0;c.length>h;)void 0!==(r=s(n,e=c[h++]))&&f(u,e,r);return u}})},function(t,e,r){r(272),t.exports=r(8).Object.values},function(t,e,r){var n=r(0),i=r(113)(!1);n(n.S,"Object",{values:function(t){return i(t)}})},function(t,e,r){r(274),t.exports=r(8).Object.entries},function(t,e,r){var n=r(0),i=r(113)(!0);n(n.S,"Object",{entries:function(t){return i(t)}})},function(t,e,r){"use strict";r(105),r(276),t.exports=r(8).Promise.finally},function(t,e,r){"use strict";var n=r(0),i=r(8),o=r(2),a=r(53),f=r(107);n(n.P+n.R,"Promise",{finally:function(t){var e=a(this,i.Promise||o.Promise),r="function"==typeof t;return this.then(r?function(r){return f(e,t()).then(function(){return r})}:t,r?function(r){return f(e,t()).then(function(){throw r})}:t)}})},function(t,e,r){r(278),r(279),r(280),t.exports=r(8)},function(t,e,r){var n=r(2),i=r(0),o=r(54),a=[].slice,f=/MSIE .\./.test(o),s=function(t){return function(e,r){var n=arguments.length>2,i=!!n&&a.call(arguments,2);return t(n?function(){("function"==typeof e?e:Function(e)).apply(this,i)}:e,r)}};i(i.G+i.B+i.F*f,{setTimeout:s(n.setTimeout),setInterval:s(n.setInterval)})},function(t,e,r){var n=r(0),i=r(81);n(n.G+n.B,{setImmediate:i.set,clearImmediate:i.clear})},function(t,e,r){for(var n=r(79),i=r(31),o=r(10),a=r(2),f=r(13),s=r(37),c=r(5),u=c("iterator"),h=c("toStringTag"),d=s.Array,l={CSSRuleList:!0,CSSStyleDeclaration:!1,CSSValueList:!1,ClientRectList:!1,DOMRectList:!1,DOMStringList:!1,DOMTokenList:!0,DataTransferItemList:!1,FileList:!1,HTMLAllCollection:!1,HTMLCollection:!1,HTMLFormElement:!1,HTMLSelectElement:!1,MediaList:!0,MimeTypeArray:!1,NamedNodeMap:!1,NodeList:!0,PaintRequestList:!1,Plugin:!1,PluginArray:!1,SVGLengthList:!1,SVGNumberList:!1,SVGPathSegList:!1,SVGPointList:!1,SVGStringList:!1,SVGTransformList:!1,SourceBufferList:!1,StyleSheetList:!0,TextTrackCueList:!1,TextTrackList:!1,TouchList:!1},p=i(l),b=0;b<p.length;b++){var y,v=p[b],g=l[v],m=a[v],_=m&&m.prototype;if(_&&(_[u]||f(_,u,d),_[h]||f(_,h,v),s[v]=d,g))for(y in n)_[y]||o(_,y,n[y],!0)}},function(t,e){!function(e){"use strict";var r,n=Object.prototype,i=n.hasOwnProperty,o="function"==typeof Symbol?Symbol:{},a=o.iterator||"@@iterator",f=o.asyncIterator||"@@asyncIterator",s=o.toStringTag||"@@toStringTag",c="object"==typeof t,u=e.regeneratorRuntime;if(u)c&&(t.exports=u);else{(u=e.regeneratorRuntime=c?t.exports:{}).wrap=_;var h="suspendedStart",d="suspendedYield",l="executing",p="completed",b={},y={};y[a]=function(){return this};var v=Object.getPrototypeOf,g=v&&v(v(P([])));g&&g!==n&&i.call(g,a)&&(y=g);var m=M.prototype=S.prototype=Object.create(y);E.prototype=m.constructor=M,M.constructor=E,M[s]=E.displayName="GeneratorFunction",u.isGeneratorFunction=function(t){var e="function"==typeof t&&t.constructor;return!!e&&(e===E||"GeneratorFunction"===(e.displayName||e.name))},u.mark=function(t){return Object.setPrototypeOf?Object.setPrototypeOf(t,M):(t.__proto__=M,s in t||(t[s]="GeneratorFunction")),t.prototype=Object.create(m),t},u.awrap=function(t){return{__await:t}},A(x.prototype),x.prototype[f]=function(){return this},u.AsyncIterator=x,u.async=function(t,e,r,n){var i=new x(_(t,e,r,n));return u.isGeneratorFunction(e)?i:i.next().then(function(t){return t.done?t.value:i.next()})},A(m),m[s]="Generator",m[a]=function(){return this},m.toString=function(){return"[object Generator]"},u.keys=function(t){var e=[];for(var r in t)e.push(r);return e.reverse(),function r(){for(;e.length;){var n=e.pop();if(n in t)return r.value=n,r.done=!1,r}return r.done=!0,r}},u.values=P,R.prototype={constructor:R,reset:function(t){if(this.prev=0,this.next=0,this.sent=this._sent=r,this.done=!1,this.delegate=null,this.method="next",this.arg=r,this.tryEntries.forEach(B),!t)for(var e in this)"t"===e.charAt(0)&&i.call(this,e)&&!isNaN(+e.slice(1))&&(this[e]=r)},stop:function(){this.done=!0;var t=this.tryEntries[0].completion;if("throw"===t.type)throw t.arg;return this.rval},dispatchException:function(t){if(this.done)throw t;var e=this;function n(n,i){return f.type="throw",f.arg=t,e.next=n,i&&(e.method="next",e.arg=r),!!i}for(var o=this.tryEntries.length-1;o>=0;--o){var a=this.tryEntries[o],f=a.completion;if("root"===a.tryLoc)return n("end");if(a.tryLoc<=this.prev){var s=i.call(a,"catchLoc"),c=i.call(a,"finallyLoc");if(s&&c){if(this.prev<a.catchLoc)return n(a.catchLoc,!0);if(this.prev<a.finallyLoc)return n(a.finallyLoc)}else if(s){if(this.prev<a.catchLoc)return n(a.catchLoc,!0)}else{if(!c)throw new Error("try statement without catch or finally");if(this.prev<a.finallyLoc)return n(a.finallyLoc)}}}},abrupt:function(t,e){for(var r=this.tryEntries.length-1;r>=0;--r){var n=this.tryEntries[r];if(n.tryLoc<=this.prev&&i.call(n,"finallyLoc")&&this.prev<n.finallyLoc){var o=n;break}}o&&("break"===t||"continue"===t)&&o.tryLoc<=e&&e<=o.finallyLoc&&(o=null);var a=o?o.completion:{};return a.type=t,a.arg=e,o?(this.method="next",this.next=o.finallyLoc,b):this.complete(a)},complete:function(t,e){if("throw"===t.type)throw t.arg;return"break"===t.type||"continue"===t.type?this.next=t.arg:"return"===t.type?(this.rval=this.arg=t.arg,this.method="return",this.next="end"):"normal"===t.type&&e&&(this.next=e),b},finish:function(t){for(var e=this.tryEntries.length-1;e>=0;--e){var r=this.tryEntries[e];if(r.finallyLoc===t)return this.complete(r.completion,r.afterLoc),B(r),b}},catch:function(t){for(var e=this.tryEntries.length-1;e>=0;--e){var r=this.tryEntries[e];if(r.tryLoc===t){var n=r.completion;if("throw"===n.type){var i=n.arg;B(r)}return i}}throw new Error("illegal catch attempt")},delegateYield:function(t,e,n){return this.delegate={iterator:P(t),resultName:e,nextLoc:n},"next"===this.method&&(this.arg=r),b}}}function _(t,e,r,n){var i=e&&e.prototype instanceof S?e:S,o=Object.create(i.prototype),a=new R(n||[]);return o._invoke=function(t,e,r){var n=h;return function(i,o){if(n===l)throw new Error("Generator is already running");if(n===p){if("throw"===i)throw o;return T()}for(r.method=i,r.arg=o;;){var a=r.delegate;if(a){var f=k(a,r);if(f){if(f===b)continue;return f}}if("next"===r.method)r.sent=r._sent=r.arg;else if("throw"===r.method){if(n===h)throw n=p,r.arg;r.dispatchException(r.arg)}else"return"===r.method&&r.abrupt("return",r.arg);n=l;var s=w(t,e,r);if("normal"===s.type){if(n=r.done?p:d,s.arg===b)continue;return{value:s.arg,done:r.done}}"throw"===s.type&&(n=p,r.method="throw",r.arg=s.arg)}}}(t,r,a),o}function w(t,e,r){try{return{type:"normal",arg:t.call(e,r)}}catch(t){return{type:"throw",arg:t}}}function S(){}function E(){}function M(){}function A(t){["next","throw","return"].forEach(function(e){t[e]=function(t){return this._invoke(e,t)}})}function x(t){var e;this._invoke=function(r,n){function o(){return new Promise(function(e,o){!function e(r,n,o,a){var f=w(t[r],t,n);if("throw"!==f.type){var s=f.arg,c=s.value;return c&&"object"==typeof c&&i.call(c,"__await")?Promise.resolve(c.__await).then(function(t){e("next",t,o,a)},function(t){e("throw",t,o,a)}):Promise.resolve(c).then(function(t){s.value=t,o(s)},a)}a(f.arg)}(r,n,e,o)})}return e=e?e.then(o,o):o()}}function k(t,e){var n=t.iterator[e.method];if(n===r){if(e.delegate=null,"throw"===e.method){if(t.iterator.return&&(e.method="return",e.arg=r,k(t,e),"throw"===e.method))return b;e.method="throw",e.arg=new TypeError("The iterator does not provide a 'throw' method")}return b}var i=w(n,t.iterator,e.arg);if("throw"===i.type)return e.method="throw",e.arg=i.arg,e.delegate=null,b;var o=i.arg;return o?o.done?(e[t.resultName]=o.value,e.next=t.nextLoc,"return"!==e.method&&(e.method="next",e.arg=r),e.delegate=null,b):o:(e.method="throw",e.arg=new TypeError("iterator result is not an object"),e.delegate=null,b)}function I(t){var e={tryLoc:t[0]};1 in t&&(e.catchLoc=t[1]),2 in t&&(e.finallyLoc=t[2],e.afterLoc=t[3]),this.tryEntries.push(e)}function B(t){var e=t.completion||{};e.type="normal",delete e.arg,t.completion=e}function R(t){this.tryEntries=[{tryLoc:"root"}],t.forEach(I,this),this.reset(!0)}function P(t){if(t){var e=t[a];if(e)return e.call(t);if("function"==typeof t.next)return t;if(!isNaN(t.length)){var n=-1,o=function e(){for(;++n<t.length;)if(i.call(t,n))return e.value=t[n],e.done=!1,e;return e.value=r,e.done=!0,e};return o.next=o}}return{next:T}}function T(){return{value:r,done:!0}}}(function(){return this}()||Function("return this")())},function(t,e,r){"use strict";r.r(e);var n=r(114);r.d(e,"Connector",function(){return n.a});var i=r(57);r.d(e,"Listener",function(){return i.a})},function(t,e,r){"use strict";(function(t){
/*!
                   * The buffer module from node.js, for the browser.
                   *
                   * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
                   * @license  MIT
                   */
var n=r(284),i=r(285),o=r(286);function a(){return s.TYPED_ARRAY_SUPPORT?2147483647:1073741823}function f(t,e){if(a()<e)throw new RangeError("Invalid typed array length");return s.TYPED_ARRAY_SUPPORT?(t=new Uint8Array(e)).__proto__=s.prototype:(null===t&&(t=new s(e)),t.length=e),t}function s(t,e,r){if(!(s.TYPED_ARRAY_SUPPORT||this instanceof s))return new s(t,e,r);if("number"==typeof t){if("string"==typeof e)throw new Error("If encoding is specified then the first argument must be a string");return h(this,t)}return c(this,t,e,r)}function c(t,e,r,n){if("number"==typeof e)throw new TypeError('"value" argument must not be a number');return"undefined"!=typeof ArrayBuffer&&e instanceof ArrayBuffer?function(t,e,r,n){if(e.byteLength,r<0||e.byteLength<r)throw new RangeError("'offset' is out of bounds");if(e.byteLength<r+(n||0))throw new RangeError("'length' is out of bounds");return e=void 0===r&&void 0===n?new Uint8Array(e):void 0===n?new Uint8Array(e,r):new Uint8Array(e,r,n),s.TYPED_ARRAY_SUPPORT?(t=e).__proto__=s.prototype:t=d(t,e),t}(t,e,r,n):"string"==typeof e?function(t,e,r){if("string"==typeof r&&""!==r||(r="utf8"),!s.isEncoding(r))throw new TypeError('"encoding" must be a valid string encoding');var n=0|p(e,r),i=(t=f(t,n)).write(e,r);return i!==n&&(t=t.slice(0,i)),t}(t,e,r):function(t,e){if(s.isBuffer(e)){var r=0|l(e.length);return 0===(t=f(t,r)).length?t:(e.copy(t,0,0,r),t)}if(e){if("undefined"!=typeof ArrayBuffer&&e.buffer instanceof ArrayBuffer||"length"in e)return"number"!=typeof e.length||function(t){return t!=t}(e.length)?f(t,0):d(t,e);if("Buffer"===e.type&&o(e.data))return d(t,e.data)}throw new TypeError("First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.")}(t,e)}function u(t){if("number"!=typeof t)throw new TypeError('"size" argument must be a number');if(t<0)throw new RangeError('"size" argument must not be negative')}function h(t,e){if(u(e),t=f(t,e<0?0:0|l(e)),!s.TYPED_ARRAY_SUPPORT)for(var r=0;r<e;++r)t[r]=0;return t}function d(t,e){var r=e.length<0?0:0|l(e.length);t=f(t,r);for(var n=0;n<r;n+=1)t[n]=255&e[n];return t}function l(t){if(t>=a())throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x"+a().toString(16)+" bytes");return 0|t}function p(t,e){if(s.isBuffer(t))return t.length;if("undefined"!=typeof ArrayBuffer&&"function"==typeof ArrayBuffer.isView&&(ArrayBuffer.isView(t)||t instanceof ArrayBuffer))return t.byteLength;"string"!=typeof t&&(t=""+t);var r=t.length;if(0===r)return 0;for(var n=!1;;)switch(e){case"ascii":case"latin1":case"binary":return r;case"utf8":case"utf-8":case void 0:return q(t).length;case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return 2*r;case"hex":return r>>>1;case"base64":return z(t).length;default:if(n)return q(t).length;e=(""+e).toLowerCase(),n=!0}}function b(t,e,r){var n=t[e];t[e]=t[r],t[r]=n}function y(t,e,r,n,i){if(0===t.length)return-1;if("string"==typeof r?(n=r,r=0):r>2147483647?r=2147483647:r<-2147483648&&(r=-2147483648),r=+r,isNaN(r)&&(r=i?0:t.length-1),r<0&&(r=t.length+r),r>=t.length){if(i)return-1;r=t.length-1}else if(r<0){if(!i)return-1;r=0}if("string"==typeof e&&(e=s.from(e,n)),s.isBuffer(e))return 0===e.length?-1:v(t,e,r,n,i);if("number"==typeof e)return e&=255,s.TYPED_ARRAY_SUPPORT&&"function"==typeof Uint8Array.prototype.indexOf?i?Uint8Array.prototype.indexOf.call(t,e,r):Uint8Array.prototype.lastIndexOf.call(t,e,r):v(t,[e],r,n,i);throw new TypeError("val must be string, number or Buffer")}function v(t,e,r,n,i){var o,a=1,f=t.length,s=e.length;if(void 0!==n&&("ucs2"===(n=String(n).toLowerCase())||"ucs-2"===n||"utf16le"===n||"utf-16le"===n)){if(t.length<2||e.length<2)return-1;a=2,f/=2,s/=2,r/=2}function c(t,e){return 1===a?t[e]:t.readUInt16BE(e*a)}if(i){var u=-1;for(o=r;o<f;o++)if(c(t,o)===c(e,-1===u?0:o-u)){if(-1===u&&(u=o),o-u+1===s)return u*a}else-1!==u&&(o-=o-u),u=-1}else for(r+s>f&&(r=f-s),o=r;o>=0;o--){for(var h=!0,d=0;d<s;d++)if(c(t,o+d)!==c(e,d)){h=!1;break}if(h)return o}return-1}function g(t,e,r,n){r=Number(r)||0;var i=t.length-r;n?(n=Number(n))>i&&(n=i):n=i;var o=e.length;if(o%2!=0)throw new TypeError("Invalid hex string");n>o/2&&(n=o/2);for(var a=0;a<n;++a){var f=parseInt(e.substr(2*a,2),16);if(isNaN(f))return a;t[r+a]=f}return a}function m(t,e,r,n){return F(q(e,t.length-r),t,r,n)}function _(t,e,r,n){return F(function(t){for(var e=[],r=0;r<t.length;++r)e.push(255&t.charCodeAt(r));return e}(e),t,r,n)}function w(t,e,r,n){return _(t,e,r,n)}function S(t,e,r,n){return F(z(e),t,r,n)}function E(t,e,r,n){return F(function(t,e){for(var r,n,i,o=[],a=0;a<t.length&&!((e-=2)<0);++a)n=(r=t.charCodeAt(a))>>8,i=r%256,o.push(i),o.push(n);return o}(e,t.length-r),t,r,n)}function M(t,e,r){return 0===e&&r===t.length?n.fromByteArray(t):n.fromByteArray(t.slice(e,r))}function A(t,e,r){r=Math.min(t.length,r);for(var n=[],i=e;i<r;){var o,a,f,s,c=t[i],u=null,h=c>239?4:c>223?3:c>191?2:1;if(i+h<=r)switch(h){case 1:c<128&&(u=c);break;case 2:128==(192&(o=t[i+1]))&&(s=(31&c)<<6|63&o)>127&&(u=s);break;case 3:o=t[i+1],a=t[i+2],128==(192&o)&&128==(192&a)&&(s=(15&c)<<12|(63&o)<<6|63&a)>2047&&(s<55296||s>57343)&&(u=s);break;case 4:o=t[i+1],a=t[i+2],f=t[i+3],128==(192&o)&&128==(192&a)&&128==(192&f)&&(s=(15&c)<<18|(63&o)<<12|(63&a)<<6|63&f)>65535&&s<1114112&&(u=s)}null===u?(u=65533,h=1):u>65535&&(u-=65536,n.push(u>>>10&1023|55296),u=56320|1023&u),n.push(u),i+=h}return function(t){var e=t.length;if(e<=x)return String.fromCharCode.apply(String,t);for(var r="",n=0;n<e;)r+=String.fromCharCode.apply(String,t.slice(n,n+=x));return r}(n)}e.Buffer=s,e.SlowBuffer=function(t){return+t!=t&&(t=0),s.alloc(+t)},e.INSPECT_MAX_BYTES=50,s.TYPED_ARRAY_SUPPORT=void 0!==t.TYPED_ARRAY_SUPPORT?t.TYPED_ARRAY_SUPPORT:function(){try{var t=new Uint8Array(1);return t.__proto__={__proto__:Uint8Array.prototype,foo:function(){return 42}},42===t.foo()&&"function"==typeof t.subarray&&0===t.subarray(1,1).byteLength}catch(t){return!1}}(),e.kMaxLength=a(),s.poolSize=8192,s._augment=function(t){return t.__proto__=s.prototype,t},s.from=function(t,e,r){return c(null,t,e,r)},s.TYPED_ARRAY_SUPPORT&&(s.prototype.__proto__=Uint8Array.prototype,s.__proto__=Uint8Array,"undefined"!=typeof Symbol&&Symbol.species&&s[Symbol.species]===s&&Object.defineProperty(s,Symbol.species,{value:null,configurable:!0})),s.alloc=function(t,e,r){return function(t,e,r,n){return u(e),e<=0?f(t,e):void 0!==r?"string"==typeof n?f(t,e).fill(r,n):f(t,e).fill(r):f(t,e)}(null,t,e,r)},s.allocUnsafe=function(t){return h(null,t)},s.allocUnsafeSlow=function(t){return h(null,t)},s.isBuffer=function(t){return!(null==t||!t._isBuffer)},s.compare=function(t,e){if(!s.isBuffer(t)||!s.isBuffer(e))throw new TypeError("Arguments must be Buffers");if(t===e)return 0;for(var r=t.length,n=e.length,i=0,o=Math.min(r,n);i<o;++i)if(t[i]!==e[i]){r=t[i],n=e[i];break}return r<n?-1:n<r?1:0},s.isEncoding=function(t){switch(String(t).toLowerCase()){case"hex":case"utf8":case"utf-8":case"ascii":case"latin1":case"binary":case"base64":case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return!0;default:return!1}},s.concat=function(t,e){if(!o(t))throw new TypeError('"list" argument must be an Array of Buffers');if(0===t.length)return s.alloc(0);var r;if(void 0===e)for(e=0,r=0;r<t.length;++r)e+=t[r].length;var n=s.allocUnsafe(e),i=0;for(r=0;r<t.length;++r){var a=t[r];if(!s.isBuffer(a))throw new TypeError('"list" argument must be an Array of Buffers');a.copy(n,i),i+=a.length}return n},s.byteLength=p,s.prototype._isBuffer=!0,s.prototype.swap16=function(){var t=this.length;if(t%2!=0)throw new RangeError("Buffer size must be a multiple of 16-bits");for(var e=0;e<t;e+=2)b(this,e,e+1);return this},s.prototype.swap32=function(){var t=this.length;if(t%4!=0)throw new RangeError("Buffer size must be a multiple of 32-bits");for(var e=0;e<t;e+=4)b(this,e,e+3),b(this,e+1,e+2);return this},s.prototype.swap64=function(){var t=this.length;if(t%8!=0)throw new RangeError("Buffer size must be a multiple of 64-bits");for(var e=0;e<t;e+=8)b(this,e,e+7),b(this,e+1,e+6),b(this,e+2,e+5),b(this,e+3,e+4);return this},s.prototype.toString=function(){var t=0|this.length;return 0===t?"":0===arguments.length?A(this,0,t):function(t,e,r){var n=!1;if((void 0===e||e<0)&&(e=0),e>this.length)return"";if((void 0===r||r>this.length)&&(r=this.length),r<=0)return"";if((r>>>=0)<=(e>>>=0))return"";for(t||(t="utf8");;)switch(t){case"hex":return B(this,e,r);case"utf8":case"utf-8":return A(this,e,r);case"ascii":return k(this,e,r);case"latin1":case"binary":return I(this,e,r);case"base64":return M(this,e,r);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return R(this,e,r);default:if(n)throw new TypeError("Unknown encoding: "+t);t=(t+"").toLowerCase(),n=!0}}.apply(this,arguments)},s.prototype.equals=function(t){if(!s.isBuffer(t))throw new TypeError("Argument must be a Buffer");return this===t||0===s.compare(this,t)},s.prototype.inspect=function(){var t="",r=e.INSPECT_MAX_BYTES;return this.length>0&&(t=this.toString("hex",0,r).match(/.{2}/g).join(" "),this.length>r&&(t+=" ... ")),"<Buffer "+t+">"},s.prototype.compare=function(t,e,r,n,i){if(!s.isBuffer(t))throw new TypeError("Argument must be a Buffer");if(void 0===e&&(e=0),void 0===r&&(r=t?t.length:0),void 0===n&&(n=0),void 0===i&&(i=this.length),e<0||r>t.length||n<0||i>this.length)throw new RangeError("out of range index");if(n>=i&&e>=r)return 0;if(n>=i)return-1;if(e>=r)return 1;if(e>>>=0,r>>>=0,n>>>=0,i>>>=0,this===t)return 0;for(var o=i-n,a=r-e,f=Math.min(o,a),c=this.slice(n,i),u=t.slice(e,r),h=0;h<f;++h)if(c[h]!==u[h]){o=c[h],a=u[h];break}return o<a?-1:a<o?1:0},s.prototype.includes=function(t,e,r){return-1!==this.indexOf(t,e,r)},s.prototype.indexOf=function(t,e,r){return y(this,t,e,r,!0)},s.prototype.lastIndexOf=function(t,e,r){return y(this,t,e,r,!1)},s.prototype.write=function(t,e,r,n){if(void 0===e)n="utf8",r=this.length,e=0;else if(void 0===r&&"string"==typeof e)n=e,r=this.length,e=0;else{if(!isFinite(e))throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");e|=0,isFinite(r)?(r|=0,void 0===n&&(n="utf8")):(n=r,r=void 0)}var i=this.length-e;if((void 0===r||r>i)&&(r=i),t.length>0&&(r<0||e<0)||e>this.length)throw new RangeError("Attempt to write outside buffer bounds");n||(n="utf8");for(var o=!1;;)switch(n){case"hex":return g(this,t,e,r);case"utf8":case"utf-8":return m(this,t,e,r);case"ascii":return _(this,t,e,r);case"latin1":case"binary":return w(this,t,e,r);case"base64":return S(this,t,e,r);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return E(this,t,e,r);default:if(o)throw new TypeError("Unknown encoding: "+n);n=(""+n).toLowerCase(),o=!0}},s.prototype.toJSON=function(){return{type:"Buffer",data:Array.prototype.slice.call(this._arr||this,0)}};var x=4096;function k(t,e,r){var n="";r=Math.min(t.length,r);for(var i=e;i<r;++i)n+=String.fromCharCode(127&t[i]);return n}function I(t,e,r){var n="";r=Math.min(t.length,r);for(var i=e;i<r;++i)n+=String.fromCharCode(t[i]);return n}function B(t,e,r){var n=t.length;(!e||e<0)&&(e=0),(!r||r<0||r>n)&&(r=n);for(var i="",o=e;o<r;++o)i+=U(t[o]);return i}function R(t,e,r){for(var n=t.slice(e,r),i="",o=0;o<n.length;o+=2)i+=String.fromCharCode(n[o]+256*n[o+1]);return i}function P(t,e,r){if(t%1!=0||t<0)throw new RangeError("offset is not uint");if(t+e>r)throw new RangeError("Trying to access beyond buffer length")}function T(t,e,r,n,i,o){if(!s.isBuffer(t))throw new TypeError('"buffer" argument must be a Buffer instance');if(e>i||e<o)throw new RangeError('"value" argument is out of bounds');if(r+n>t.length)throw new RangeError("Index out of range")}function L(t,e,r,n){e<0&&(e=65535+e+1);for(var i=0,o=Math.min(t.length-r,2);i<o;++i)t[r+i]=(e&255<<8*(n?i:1-i))>>>8*(n?i:1-i)}function O(t,e,r,n){e<0&&(e=4294967295+e+1);for(var i=0,o=Math.min(t.length-r,4);i<o;++i)t[r+i]=e>>>8*(n?i:3-i)&255}function C(t,e,r,n,i,o){if(r+n>t.length)throw new RangeError("Index out of range");if(r<0)throw new RangeError("Index out of range")}function j(t,e,r,n,o){return o||C(t,0,r,4),i.write(t,e,r,n,23,4),r+4}function N(t,e,r,n,o){return o||C(t,0,r,8),i.write(t,e,r,n,52,8),r+8}s.prototype.slice=function(t,e){var r,n=this.length;if(t=~~t,e=void 0===e?n:~~e,t<0?(t+=n)<0&&(t=0):t>n&&(t=n),e<0?(e+=n)<0&&(e=0):e>n&&(e=n),e<t&&(e=t),s.TYPED_ARRAY_SUPPORT)(r=this.subarray(t,e)).__proto__=s.prototype;else{var i=e-t;r=new s(i,void 0);for(var o=0;o<i;++o)r[o]=this[o+t]}return r},s.prototype.readUIntLE=function(t,e,r){t|=0,e|=0,r||P(t,e,this.length);for(var n=this[t],i=1,o=0;++o<e&&(i*=256);)n+=this[t+o]*i;return n},s.prototype.readUIntBE=function(t,e,r){t|=0,e|=0,r||P(t,e,this.length);for(var n=this[t+--e],i=1;e>0&&(i*=256);)n+=this[t+--e]*i;return n},s.prototype.readUInt8=function(t,e){return e||P(t,1,this.length),this[t]},s.prototype.readUInt16LE=function(t,e){return e||P(t,2,this.length),this[t]|this[t+1]<<8},s.prototype.readUInt16BE=function(t,e){return e||P(t,2,this.length),this[t]<<8|this[t+1]},s.prototype.readUInt32LE=function(t,e){return e||P(t,4,this.length),(this[t]|this[t+1]<<8|this[t+2]<<16)+16777216*this[t+3]},s.prototype.readUInt32BE=function(t,e){return e||P(t,4,this.length),16777216*this[t]+(this[t+1]<<16|this[t+2]<<8|this[t+3])},s.prototype.readIntLE=function(t,e,r){t|=0,e|=0,r||P(t,e,this.length);for(var n=this[t],i=1,o=0;++o<e&&(i*=256);)n+=this[t+o]*i;return n>=(i*=128)&&(n-=Math.pow(2,8*e)),n},s.prototype.readIntBE=function(t,e,r){t|=0,e|=0,r||P(t,e,this.length);for(var n=e,i=1,o=this[t+--n];n>0&&(i*=256);)o+=this[t+--n]*i;return o>=(i*=128)&&(o-=Math.pow(2,8*e)),o},s.prototype.readInt8=function(t,e){return e||P(t,1,this.length),128&this[t]?-1*(255-this[t]+1):this[t]},s.prototype.readInt16LE=function(t,e){e||P(t,2,this.length);var r=this[t]|this[t+1]<<8;return 32768&r?4294901760|r:r},s.prototype.readInt16BE=function(t,e){e||P(t,2,this.length);var r=this[t+1]|this[t]<<8;return 32768&r?4294901760|r:r},s.prototype.readInt32LE=function(t,e){return e||P(t,4,this.length),this[t]|this[t+1]<<8|this[t+2]<<16|this[t+3]<<24},s.prototype.readInt32BE=function(t,e){return e||P(t,4,this.length),this[t]<<24|this[t+1]<<16|this[t+2]<<8|this[t+3]},s.prototype.readFloatLE=function(t,e){return e||P(t,4,this.length),i.read(this,t,!0,23,4)},s.prototype.readFloatBE=function(t,e){return e||P(t,4,this.length),i.read(this,t,!1,23,4)},s.prototype.readDoubleLE=function(t,e){return e||P(t,8,this.length),i.read(this,t,!0,52,8)},s.prototype.readDoubleBE=function(t,e){return e||P(t,8,this.length),i.read(this,t,!1,52,8)},s.prototype.writeUIntLE=function(t,e,r,n){t=+t,e|=0,r|=0,n||T(this,t,e,r,Math.pow(2,8*r)-1,0);var i=1,o=0;for(this[e]=255&t;++o<r&&(i*=256);)this[e+o]=t/i&255;return e+r},s.prototype.writeUIntBE=function(t,e,r,n){t=+t,e|=0,r|=0,n||T(this,t,e,r,Math.pow(2,8*r)-1,0);var i=r-1,o=1;for(this[e+i]=255&t;--i>=0&&(o*=256);)this[e+i]=t/o&255;return e+r},s.prototype.writeUInt8=function(t,e,r){return t=+t,e|=0,r||T(this,t,e,1,255,0),s.TYPED_ARRAY_SUPPORT||(t=Math.floor(t)),this[e]=255&t,e+1},s.prototype.writeUInt16LE=function(t,e,r){return t=+t,e|=0,r||T(this,t,e,2,65535,0),s.TYPED_ARRAY_SUPPORT?(this[e]=255&t,this[e+1]=t>>>8):L(this,t,e,!0),e+2},s.prototype.writeUInt16BE=function(t,e,r){return t=+t,e|=0,r||T(this,t,e,2,65535,0),s.TYPED_ARRAY_SUPPORT?(this[e]=t>>>8,this[e+1]=255&t):L(this,t,e,!1),e+2},s.prototype.writeUInt32LE=function(t,e,r){return t=+t,e|=0,r||T(this,t,e,4,4294967295,0),s.TYPED_ARRAY_SUPPORT?(this[e+3]=t>>>24,this[e+2]=t>>>16,this[e+1]=t>>>8,this[e]=255&t):O(this,t,e,!0),e+4},s.prototype.writeUInt32BE=function(t,e,r){return t=+t,e|=0,r||T(this,t,e,4,4294967295,0),s.TYPED_ARRAY_SUPPORT?(this[e]=t>>>24,this[e+1]=t>>>16,this[e+2]=t>>>8,this[e+3]=255&t):O(this,t,e,!1),e+4},s.prototype.writeIntLE=function(t,e,r,n){if(t=+t,e|=0,!n){var i=Math.pow(2,8*r-1);T(this,t,e,r,i-1,-i)}var o=0,a=1,f=0;for(this[e]=255&t;++o<r&&(a*=256);)t<0&&0===f&&0!==this[e+o-1]&&(f=1),this[e+o]=(t/a>>0)-f&255;return e+r},s.prototype.writeIntBE=function(t,e,r,n){if(t=+t,e|=0,!n){var i=Math.pow(2,8*r-1);T(this,t,e,r,i-1,-i)}var o=r-1,a=1,f=0;for(this[e+o]=255&t;--o>=0&&(a*=256);)t<0&&0===f&&0!==this[e+o+1]&&(f=1),this[e+o]=(t/a>>0)-f&255;return e+r},s.prototype.writeInt8=function(t,e,r){return t=+t,e|=0,r||T(this,t,e,1,127,-128),s.TYPED_ARRAY_SUPPORT||(t=Math.floor(t)),t<0&&(t=255+t+1),this[e]=255&t,e+1},s.prototype.writeInt16LE=function(t,e,r){return t=+t,e|=0,r||T(this,t,e,2,32767,-32768),s.TYPED_ARRAY_SUPPORT?(this[e]=255&t,this[e+1]=t>>>8):L(this,t,e,!0),e+2},s.prototype.writeInt16BE=function(t,e,r){return t=+t,e|=0,r||T(this,t,e,2,32767,-32768),s.TYPED_ARRAY_SUPPORT?(this[e]=t>>>8,this[e+1]=255&t):L(this,t,e,!1),e+2},s.prototype.writeInt32LE=function(t,e,r){return t=+t,e|=0,r||T(this,t,e,4,2147483647,-2147483648),s.TYPED_ARRAY_SUPPORT?(this[e]=255&t,this[e+1]=t>>>8,this[e+2]=t>>>16,this[e+3]=t>>>24):O(this,t,e,!0),e+4},s.prototype.writeInt32BE=function(t,e,r){return t=+t,e|=0,r||T(this,t,e,4,2147483647,-2147483648),t<0&&(t=4294967295+t+1),s.TYPED_ARRAY_SUPPORT?(this[e]=t>>>24,this[e+1]=t>>>16,this[e+2]=t>>>8,this[e+3]=255&t):O(this,t,e,!1),e+4},s.prototype.writeFloatLE=function(t,e,r){return j(this,t,e,!0,r)},s.prototype.writeFloatBE=function(t,e,r){return j(this,t,e,!1,r)},s.prototype.writeDoubleLE=function(t,e,r){return N(this,t,e,!0,r)},s.prototype.writeDoubleBE=function(t,e,r){return N(this,t,e,!1,r)},s.prototype.copy=function(t,e,r,n){if(r||(r=0),n||0===n||(n=this.length),e>=t.length&&(e=t.length),e||(e=0),n>0&&n<r&&(n=r),n===r)return 0;if(0===t.length||0===this.length)return 0;if(e<0)throw new RangeError("targetStart out of bounds");if(r<0||r>=this.length)throw new RangeError("sourceStart out of bounds");if(n<0)throw new RangeError("sourceEnd out of bounds");n>this.length&&(n=this.length),t.length-e<n-r&&(n=t.length-e+r);var i,o=n-r;if(this===t&&r<e&&e<n)for(i=o-1;i>=0;--i)t[i+e]=this[i+r];else if(o<1e3||!s.TYPED_ARRAY_SUPPORT)for(i=0;i<o;++i)t[i+e]=this[i+r];else Uint8Array.prototype.set.call(t,this.subarray(r,r+o),e);return o},s.prototype.fill=function(t,e,r,n){if("string"==typeof t){if("string"==typeof e?(n=e,e=0,r=this.length):"string"==typeof r&&(n=r,r=this.length),1===t.length){var i=t.charCodeAt(0);i<256&&(t=i)}if(void 0!==n&&"string"!=typeof n)throw new TypeError("encoding must be a string");if("string"==typeof n&&!s.isEncoding(n))throw new TypeError("Unknown encoding: "+n)}else"number"==typeof t&&(t&=255);if(e<0||this.length<e||this.length<r)throw new RangeError("Out of range index");if(r<=e)return this;var o;if(e>>>=0,r=void 0===r?this.length:r>>>0,t||(t=0),"number"==typeof t)for(o=e;o<r;++o)this[o]=t;else{var a=s.isBuffer(t)?t:q(new s(t,n).toString()),f=a.length;for(o=0;o<r-e;++o)this[o+e]=a[o%f]}return this};var D=/[^+\/0-9A-Za-z-_]/g;function U(t){return t<16?"0"+t.toString(16):t.toString(16)}function q(t,e){var r;e=e||1/0;for(var n=t.length,i=null,o=[],a=0;a<n;++a){if((r=t.charCodeAt(a))>55295&&r<57344){if(!i){if(r>56319){(e-=3)>-1&&o.push(239,191,189);continue}if(a+1===n){(e-=3)>-1&&o.push(239,191,189);continue}i=r;continue}if(r<56320){(e-=3)>-1&&o.push(239,191,189),i=r;continue}r=65536+(i-55296<<10|r-56320)}else i&&(e-=3)>-1&&o.push(239,191,189);if(i=null,r<128){if((e-=1)<0)break;o.push(r)}else if(r<2048){if((e-=2)<0)break;o.push(r>>6|192,63&r|128)}else if(r<65536){if((e-=3)<0)break;o.push(r>>12|224,r>>6&63|128,63&r|128)}else{if(!(r<1114112))throw new Error("Invalid code point");if((e-=4)<0)break;o.push(r>>18|240,r>>12&63|128,r>>6&63|128,63&r|128)}}return o}function z(t){return n.toByteArray(function(t){if((t=function(t){return t.trim?t.trim():t.replace(/^\s+|\s+$/g,"")}(t).replace(D,"")).length<2)return"";for(;t.length%4!=0;)t+="=";return t}(t))}function F(t,e,r,n){for(var i=0;i<n&&!(i+r>=e.length||i>=t.length);++i)e[i+r]=t[i];return i}}).call(this,r(84))},function(t,e,r){"use strict";e.byteLength=function(t){var e=c(t),r=e[0],n=e[1];return 3*(r+n)/4-n},e.toByteArray=function(t){for(var e,r=c(t),n=r[0],a=r[1],f=new o(3*(n+a)/4-a),s=0,u=a>0?n-4:n,h=0;h<u;h+=4)e=i[t.charCodeAt(h)]<<18|i[t.charCodeAt(h+1)]<<12|i[t.charCodeAt(h+2)]<<6|i[t.charCodeAt(h+3)],f[s++]=e>>16&255,f[s++]=e>>8&255,f[s++]=255&e;return 2===a&&(e=i[t.charCodeAt(h)]<<2|i[t.charCodeAt(h+1)]>>4,f[s++]=255&e),1===a&&(e=i[t.charCodeAt(h)]<<10|i[t.charCodeAt(h+1)]<<4|i[t.charCodeAt(h+2)]>>2,f[s++]=e>>8&255,f[s++]=255&e),f},e.fromByteArray=function(t){for(var e,r=t.length,i=r%3,o=[],a=0,f=r-i;a<f;a+=16383)o.push(h(t,a,a+16383>f?f:a+16383));return 1===i?(e=t[r-1],o.push(n[e>>2]+n[e<<4&63]+"==")):2===i&&(e=(t[r-2]<<8)+t[r-1],o.push(n[e>>10]+n[e>>4&63]+n[e<<2&63]+"=")),o.join("")};for(var n=[],i=[],o="undefined"!=typeof Uint8Array?Uint8Array:Array,a="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",f=0,s=a.length;f<s;++f)n[f]=a[f],i[a.charCodeAt(f)]=f;function c(t){var e=t.length;if(e%4>0)throw new Error("Invalid string. Length must be a multiple of 4");var r=t.indexOf("=");return-1===r&&(r=e),[r,r===e?0:4-r%4]}function u(t){return n[t>>18&63]+n[t>>12&63]+n[t>>6&63]+n[63&t]}function h(t,e,r){for(var n,i=[],o=e;o<r;o+=3)n=(t[o]<<16&16711680)+(t[o+1]<<8&65280)+(255&t[o+2]),i.push(u(n));return i.join("")}i["-".charCodeAt(0)]=62,i["_".charCodeAt(0)]=63},function(t,e){e.read=function(t,e,r,n,i){var o,a,f=8*i-n-1,s=(1<<f)-1,c=s>>1,u=-7,h=r?i-1:0,d=r?-1:1,l=t[e+h];for(h+=d,o=l&(1<<-u)-1,l>>=-u,u+=f;u>0;o=256*o+t[e+h],h+=d,u-=8);for(a=o&(1<<-u)-1,o>>=-u,u+=n;u>0;a=256*a+t[e+h],h+=d,u-=8);if(0===o)o=1-c;else{if(o===s)return a?NaN:1/0*(l?-1:1);a+=Math.pow(2,n),o-=c}return(l?-1:1)*a*Math.pow(2,o-n)},e.write=function(t,e,r,n,i,o){var a,f,s,c=8*o-i-1,u=(1<<c)-1,h=u>>1,d=23===i?Math.pow(2,-24)-Math.pow(2,-77):0,l=n?0:o-1,p=n?1:-1,b=e<0||0===e&&1/e<0?1:0;for(e=Math.abs(e),isNaN(e)||e===1/0?(f=isNaN(e)?1:0,a=u):(a=Math.floor(Math.log(e)/Math.LN2),e*(s=Math.pow(2,-a))<1&&(a--,s*=2),(e+=a+h>=1?d/s:d*Math.pow(2,1-h))*s>=2&&(a++,s/=2),a+h>=u?(f=0,a=u):a+h>=1?(f=(e*s-1)*Math.pow(2,i),a+=h):(f=e*Math.pow(2,h-1)*Math.pow(2,i),a=0));i>=8;t[r+l]=255&f,l+=p,f/=256,i-=8);for(a=a<<i|f,c+=i;c>0;t[r+l]=255&a,l+=p,a/=256,c-=8);t[r+l-p]|=128*b}},function(t,e){var r={}.toString;t.exports=Array.isArray||function(t){return"[object Array]"==r.call(t)}}])},function(t,e,r){t.exports=r(74)},function(t,e,r){"use strict";r.r(e),r.d(e,"default",function(){return d});var n=r(72);function i(t){return(i="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}function o(t){for(var e=1;e<arguments.length;e++){var r=null!=arguments[e]?arguments[e]:{},n=Object.keys(r);"function"==typeof Object.getOwnPropertySymbols&&(n=n.concat(Object.getOwnPropertySymbols(r).filter(function(t){return Object.getOwnPropertyDescriptor(r,t).enumerable}))),n.forEach(function(e){a(t,e,r[e])})}return t}function a(t,e,r){return e in t?Object.defineProperty(t,e,{value:r,enumerable:!0,configurable:!0,writable:!0}):t[e]=r,t}function f(t,e,r,n,i,o,a){try{var f=t[o](a),s=f.value}catch(t){return void r(t)}f.done?e(s):Promise.resolve(s).then(n,i)}function s(t){return function(){var e=this,r=arguments;return new Promise(function(n,i){var o=t.apply(e,r);function a(t){f(o,n,i,a,s,"next",t)}function s(t){f(o,n,i,a,s,"throw",t)}a(void 0)})}}function c(t){return(c=Object.setPrototypeOf?Object.getPrototypeOf:function(t){return t.__proto__||Object.getPrototypeOf(t)})(t)}function u(t,e){return(u=Object.setPrototypeOf||function(t,e){return t.__proto__=e,t})(t,e)}var h=null;"undefined"!=typeof window&&void 0!==window.localStorage&&(h=window.localStorage);var d=function(t){function e(){return function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,e),function(t,e){return!e||"object"!==i(e)&&"function"!=typeof e?function(t){if(void 0===t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return t}(t):e}(this,c(e).apply(this,arguments))}return function(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function");t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,writable:!0,configurable:!0}}),e&&u(t,e)}(e,n.Connector),function(t,e,r){e&&function(t,e){for(var r=0;r<e.length;r++){var n=e[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}(t.prototype,e)}(e,[{key:"initSession",value:function(){var t=s(regeneratorRuntime.mark(function t(){var e,r,n,i;return regeneratorRuntime.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:if(e=null,!(r=this.getLocalSession())){t.next=13;break}if(!(r.expires>Date.now())){t.next=12;break}return this.sessionId=r.sessionId,this.symKey=r.symKey,t.next=8,this.getSessionStatus();case 8:(n=t.sent)&&(e=o({},r,{accounts:n.accounts,expires:n.expires})),t.next=13;break;case 12:this.deleteLocalSession(r);case 13:if(!(i=e||null)){t.next=24;break}this.accounts=i.accounts,this.bridgeUrl=i.bridgeUrl,this.sessionId=i.sessionId,this.symKey=i.symKey,this.dappName=i.dappName,this.expires=i.expires,this.isConnected=!0,t.next=27;break;case 24:return t.next=26,this.createSession();case 26:i=t.sent;case 27:return t.abrupt("return",i);case 28:case"end":return t.stop()}},t,this)}));return function(){return t.apply(this,arguments)}}()},{key:"createSession",value:function(){var t=s(regeneratorRuntime.mark(function t(){var e,r;return regeneratorRuntime.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,this.generateKey();case 2:return this.symKey=t.sent,t.next=5,this._fetchBridge("/session/new",{method:"POST"});case 5:return e=t.sent,this.sessionId=e.sessionId,this.expires=e.expires,this.accounts=[],r=this.toJSON(),this.saveLocalSession(r),t.abrupt("return",r);case 12:case"end":return t.stop()}},t,this)}));return function(){return t.apply(this,arguments)}}()},{key:"killSession",value:function(){this.sessionId=null,this.symKey=null,this.expires=null,this.isConnected=!1,this.deleteLocalSession()}},{key:"sendTransaction",value:function(){var t=s(regeneratorRuntime.mark(function t(){var e,r,n=arguments;return regeneratorRuntime.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return e=n.length>0&&void 0!==n[0]?n[0]:{},t.prev=1,t.next=4,this.createCallRequest({method:"eth_sendTransaction",params:[e]});case 4:return r=t.sent,t.abrupt("return",r);case 8:throw t.prev=8,t.t0=t.catch(1),new Error("Rejected: Signed Transaction Request");case 11:case"end":return t.stop()}},t,this,[[1,8]])}));return function(){return t.apply(this,arguments)}}()},{key:"signMessage",value:function(){var t=s(regeneratorRuntime.mark(function t(e){var r;return regeneratorRuntime.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return t.prev=0,t.next=3,this.createCallRequest({method:"eth_sign",params:[e]});case 3:return r=t.sent,t.abrupt("return",r);case 7:throw t.prev=7,t.t0=t.catch(0),new Error("Rejected: Signed Message Request");case 10:case"end":return t.stop()}},t,this,[[0,7]])}));return function(e){return t.apply(this,arguments)}}()},{key:"signTypedData",value:function(){var t=s(regeneratorRuntime.mark(function t(e){var r;return regeneratorRuntime.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return t.prev=0,t.next=3,this.createCallRequest({method:"eth_signTypedData",params:[e]});case 3:return r=t.sent,t.abrupt("return",r);case 7:throw t.prev=7,t.t0=t.catch(0),new Error("Rejected: Signed TypedData Request");case 10:case"end":return t.stop()}},t,this,[[0,7]])}));return function(e){return t.apply(this,arguments)}}()},{key:"createCallRequest",value:function(){var t=s(regeneratorRuntime.mark(function t(e){var r,n,i,o;return regeneratorRuntime.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:if(this.isConnected){t.next=2;break}throw new Error("Initiate session using `initSession` before creating a call request");case 2:return r=this.formatPayload(e),t.next=5,this.encrypt(r);case 5:return n=t.sent,t.next=8,this._fetchBridge("/session/".concat(this.sessionId,"/call/new"),{method:"POST"},{encryptionPayload:n,dappName:this.dappName});case 8:return i=t.sent,t.next=11,this.listenCallStatus(i.callId);case 11:if(!(o=t.sent).approved){t.next=16;break}return t.abrupt("return",o.result);case 16:throw new Error("Rejected Call Request");case 17:case"end":return t.stop()}},t,this)}));return function(e){return t.apply(this,arguments)}}()},{key:"getSessionStatus",value:function(){var t=s(regeneratorRuntime.mark(function t(){var e,r;return regeneratorRuntime.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:if(this.sessionId){t.next=2;break}throw new Error("sessionId is required");case 2:return t.next=4,this._getEncryptedData("/session/".concat(this.sessionId));case 4:if(!(e=t.sent)){t.next=17;break}if(!e.data.approved){t.next=15;break}return this.expires=e.expires,this.accounts=e.data.accounts,this.isConnected=!0,r=this.toJSON(),this.saveLocalSession(r),t.abrupt("return",r);case 15:return this.isConnected=!1,t.abrupt("return",null);case 17:return t.abrupt("return",null);case 18:case"end":return t.stop()}},t,this)}));return function(){return t.apply(this,arguments)}}()},{key:"getCallStatus",value:function(){var t=s(regeneratorRuntime.mark(function t(e){var r;return regeneratorRuntime.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:if(this.sessionId&&e){t.next=2;break}throw new Error("sessionId and callId are required");case 2:return t.next=4,this._getEncryptedData("/call-status/".concat(e));case 4:if(!(r=t.sent)){t.next=7;break}return t.abrupt("return",r.data);case 7:return t.abrupt("return",null);case 8:case"end":return t.stop()}},t,this)}));return function(e){return t.apply(this,arguments)}}()},{key:"listenSessionStatus",value:function(t,e){var r=this;return this.promisifyListener({fn:function(){var t=s(regeneratorRuntime.mark(function t(){return regeneratorRuntime.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,r.getSessionStatus();case 2:return t.abrupt("return",t.sent);case 3:case"end":return t.stop()}},t,this)}));return function(){return t.apply(this,arguments)}}(),interval:t,timeout:e})}},{key:"listenCallStatus",value:function(t,e,r){var n=this;return this.promisifyListener({fn:function(){var e=s(regeneratorRuntime.mark(function e(){return regeneratorRuntime.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,n.getCallStatus(t);case 2:return e.abrupt("return",e.sent);case 3:case"end":return e.stop()}},e,this)}));return function(){return e.apply(this,arguments)}}(),interval:e,timeout:r})}},{key:"getLocalSession",value:function(){var t=null,e=h&&h.getItem("wcsmngt");return e&&(t=this.checkObject(e,"local session")),t}},{key:"saveLocalSession",value:function(t){h.setItem("wcsmngt",JSON.stringify(t))}},{key:"deleteLocalSession",value:function(){h.removeItem("wcsmngt")}}]),e}()},function(t,e,r){"use strict";e.randomBytes=e.rng=e.pseudoRandomBytes=e.prng=r(11),e.createHash=e.Hash=r(13),e.createHmac=e.Hmac=r(45);var n=r(94),i=Object.keys(n),o=["sha1","sha224","sha256","sha384","sha512","md5","rmd160"].concat(i);e.getHashes=function(){return o};var a=r(48);e.pbkdf2=a.pbkdf2,e.pbkdf2Sync=a.pbkdf2Sync;var f=r(96);e.Cipher=f.Cipher,e.createCipher=f.createCipher,e.Cipheriv=f.Cipheriv,e.createCipheriv=f.createCipheriv,e.Decipher=f.Decipher,e.createDecipher=f.createDecipher,e.Decipheriv=f.Decipheriv,e.createDecipheriv=f.createDecipheriv,e.getCiphers=f.getCiphers,e.listCiphers=f.listCiphers;var s=r(113);e.DiffieHellmanGroup=s.DiffieHellmanGroup,e.createDiffieHellmanGroup=s.createDiffieHellmanGroup,e.getDiffieHellman=s.getDiffieHellman,e.createDiffieHellman=s.createDiffieHellman,e.DiffieHellman=s.DiffieHellman;var c=r(119);e.createSign=c.createSign,e.Sign=c.Sign,e.createVerify=c.createVerify,e.Verify=c.Verify,e.createECDH=r(157);var u=r(158);e.publicEncrypt=u.publicEncrypt,e.privateEncrypt=u.privateEncrypt,e.publicDecrypt=u.publicDecrypt,e.privateDecrypt=u.privateDecrypt;var h=r(161);e.randomFill=h.randomFill,e.randomFillSync=h.randomFillSync,e.createCredentials=function(){throw new Error(["sorry, createCredentials is not implemented yet","we accept pull requests","https://github.com/crypto-browserify/crypto-browserify"].join("\n"))},e.constants={DH_CHECK_P_NOT_SAFE_PRIME:2,DH_CHECK_P_NOT_PRIME:1,DH_UNABLE_TO_CHECK_GENERATOR:4,DH_NOT_SUITABLE_GENERATOR:8,NPN_ENABLED:1,ALPN_ENABLED:1,RSA_PKCS1_PADDING:1,RSA_SSLV23_PADDING:2,RSA_NO_PADDING:3,RSA_PKCS1_OAEP_PADDING:4,RSA_X931_PADDING:5,RSA_PKCS1_PSS_PADDING:6,POINT_CONVERSION_COMPRESSED:2,POINT_CONVERSION_UNCOMPRESSED:4,POINT_CONVERSION_HYBRID:6}},function(t,e,r){"use strict";e.byteLength=function(t){var e=c(t),r=e[0],n=e[1];return 3*(r+n)/4-n},e.toByteArray=function(t){for(var e,r=c(t),n=r[0],a=r[1],f=new o(3*(n+a)/4-a),s=0,u=a>0?n-4:n,h=0;h<u;h+=4)e=i[t.charCodeAt(h)]<<18|i[t.charCodeAt(h+1)]<<12|i[t.charCodeAt(h+2)]<<6|i[t.charCodeAt(h+3)],f[s++]=e>>16&255,f[s++]=e>>8&255,f[s++]=255&e;return 2===a&&(e=i[t.charCodeAt(h)]<<2|i[t.charCodeAt(h+1)]>>4,f[s++]=255&e),1===a&&(e=i[t.charCodeAt(h)]<<10|i[t.charCodeAt(h+1)]<<4|i[t.charCodeAt(h+2)]>>2,f[s++]=e>>8&255,f[s++]=255&e),f},e.fromByteArray=function(t){for(var e,r=t.length,i=r%3,o=[],a=0,f=r-i;a<f;a+=16383)o.push(h(t,a,a+16383>f?f:a+16383));return 1===i?(e=t[r-1],o.push(n[e>>2]+n[e<<4&63]+"==")):2===i&&(e=(t[r-2]<<8)+t[r-1],o.push(n[e>>10]+n[e>>4&63]+n[e<<2&63]+"=")),o.join("")};for(var n=[],i=[],o="undefined"!=typeof Uint8Array?Uint8Array:Array,a="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",f=0,s=a.length;f<s;++f)n[f]=a[f],i[a.charCodeAt(f)]=f;function c(t){var e=t.length;if(e%4>0)throw new Error("Invalid string. Length must be a multiple of 4");var r=t.indexOf("=");return-1===r&&(r=e),[r,r===e?0:4-r%4]}function u(t){return n[t>>18&63]+n[t>>12&63]+n[t>>6&63]+n[63&t]}function h(t,e,r){for(var n,i=[],o=e;o<r;o+=3)n=(t[o]<<16&16711680)+(t[o+1]<<8&65280)+(255&t[o+2]),i.push(u(n));return i.join("")}i["-".charCodeAt(0)]=62,i["_".charCodeAt(0)]=63},function(t,e){e.read=function(t,e,r,n,i){var o,a,f=8*i-n-1,s=(1<<f)-1,c=s>>1,u=-7,h=r?i-1:0,d=r?-1:1,l=t[e+h];for(h+=d,o=l&(1<<-u)-1,l>>=-u,u+=f;u>0;o=256*o+t[e+h],h+=d,u-=8);for(a=o&(1<<-u)-1,o>>=-u,u+=n;u>0;a=256*a+t[e+h],h+=d,u-=8);if(0===o)o=1-c;else{if(o===s)return a?NaN:1/0*(l?-1:1);a+=Math.pow(2,n),o-=c}return(l?-1:1)*a*Math.pow(2,o-n)},e.write=function(t,e,r,n,i,o){var a,f,s,c=8*o-i-1,u=(1<<c)-1,h=u>>1,d=23===i?Math.pow(2,-24)-Math.pow(2,-77):0,l=n?0:o-1,p=n?1:-1,b=e<0||0===e&&1/e<0?1:0;for(e=Math.abs(e),isNaN(e)||e===1/0?(f=isNaN(e)?1:0,a=u):(a=Math.floor(Math.log(e)/Math.LN2),e*(s=Math.pow(2,-a))<1&&(a--,s*=2),(e+=a+h>=1?d/s:d*Math.pow(2,1-h))*s>=2&&(a++,s/=2),a+h>=u?(f=0,a=u):a+h>=1?(f=(e*s-1)*Math.pow(2,i),a+=h):(f=e*Math.pow(2,h-1)*Math.pow(2,i),a=0));i>=8;t[r+l]=255&f,l+=p,f/=256,i-=8);for(a=a<<i|f,c+=i;c>0;t[r+l]=255&a,l+=p,a/=256,c-=8);t[r+l-p]|=128*b}},function(t,e){},function(t,e,r){"use strict";var n=r(1).Buffer,i=r(80);function o(t,e,r){t.copy(e,r)}t.exports=function(){function t(){!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),this.head=null,this.tail=null,this.length=0}return t.prototype.push=function(t){var e={data:t,next:null};this.length>0?this.tail.next=e:this.head=e,this.tail=e,++this.length},t.prototype.unshift=function(t){var e={data:t,next:this.head};0===this.length&&(this.tail=e),this.head=e,++this.length},t.prototype.shift=function(){if(0!==this.length){var t=this.head.data;return 1===this.length?this.head=this.tail=null:this.head=this.head.next,--this.length,t}},t.prototype.clear=function(){this.head=this.tail=null,this.length=0},t.prototype.join=function(t){if(0===this.length)return"";for(var e=this.head,r=""+e.data;e=e.next;)r+=t+e.data;return r},t.prototype.concat=function(t){if(0===this.length)return n.alloc(0);if(1===this.length)return this.head.data;for(var e=n.allocUnsafe(t>>>0),r=this.head,i=0;r;)o(r.data,e,i),i+=r.data.length,r=r.next;return e},t}(),i&&i.inspect&&i.inspect.custom&&(t.exports.prototype[i.inspect.custom]=function(){var t=i.inspect({length:this.length});return this.constructor.name+" "+t})},function(t,e){},function(t,e,r){(function(t){var n=void 0!==t&&t||"undefined"!=typeof self&&self||window,i=Function.prototype.apply;function o(t,e){this._id=t,this._clearFn=e}e.setTimeout=function(){return new o(i.call(setTimeout,n,arguments),clearTimeout)},e.setInterval=function(){return new o(i.call(setInterval,n,arguments),clearInterval)},e.clearTimeout=e.clearInterval=function(t){t&&t.close()},o.prototype.unref=o.prototype.ref=function(){},o.prototype.close=function(){this._clearFn.call(n,this._id)},e.enroll=function(t,e){clearTimeout(t._idleTimeoutId),t._idleTimeout=e},e.unenroll=function(t){clearTimeout(t._idleTimeoutId),t._idleTimeout=-1},e._unrefActive=e.active=function(t){clearTimeout(t._idleTimeoutId);var e=t._idleTimeout;e>=0&&(t._idleTimeoutId=setTimeout(function(){t._onTimeout&&t._onTimeout()},e))},r(82),e.setImmediate="undefined"!=typeof self&&self.setImmediate||void 0!==t&&t.setImmediate||this&&this.setImmediate,e.clearImmediate="undefined"!=typeof self&&self.clearImmediate||void 0!==t&&t.clearImmediate||this&&this.clearImmediate}).call(this,r(7))},function(t,e,r){(function(t,e){!function(t,r){"use strict";if(!t.setImmediate){var n,i=1,o={},a=!1,f=t.document,s=Object.getPrototypeOf&&Object.getPrototypeOf(t);s=s&&s.setTimeout?s:t,"[object process]"==={}.toString.call(t.process)?n=function(t){e.nextTick(function(){u(t)})}:function(){if(t.postMessage&&!t.importScripts){var e=!0,r=t.onmessage;return t.onmessage=function(){e=!1},t.postMessage("","*"),t.onmessage=r,e}}()?function(){var e="setImmediate$"+Math.random()+"$",r=function(r){r.source===t&&"string"==typeof r.data&&0===r.data.indexOf(e)&&u(+r.data.slice(e.length))};t.addEventListener?t.addEventListener("message",r,!1):t.attachEvent("onmessage",r),n=function(r){t.postMessage(e+r,"*")}}():t.MessageChannel?function(){var t=new MessageChannel;t.port1.onmessage=function(t){u(t.data)},n=function(e){t.port2.postMessage(e)}}():f&&"onreadystatechange"in f.createElement("script")?function(){var t=f.documentElement;n=function(e){var r=f.createElement("script");r.onreadystatechange=function(){u(e),r.onreadystatechange=null,t.removeChild(r),r=null},t.appendChild(r)}}():n=function(t){setTimeout(u,0,t)},s.setImmediate=function(t){"function"!=typeof t&&(t=new Function(""+t));for(var e=new Array(arguments.length-1),r=0;r<e.length;r++)e[r]=arguments[r+1];var a={callback:t,args:e};return o[i]=a,n(i),i++},s.clearImmediate=c}function c(t){delete o[t]}function u(t){if(a)setTimeout(u,0,t);else{var e=o[t];if(e){a=!0;try{!function(t){var e=t.callback,n=t.args;switch(n.length){case 0:e();break;case 1:e(n[0]);break;case 2:e(n[0],n[1]);break;case 3:e(n[0],n[1],n[2]);break;default:e.apply(r,n)}}(e)}finally{c(t),a=!1}}}}}("undefined"==typeof self?void 0===t?this:t:self)}).call(this,r(7),r(8))},function(t,e,r){(function(e){function r(t){try{if(!e.localStorage)return!1}catch(t){return!1}var r=e.localStorage[t];return null!=r&&"true"===String(r).toLowerCase()}t.exports=function(t,e){if(r("noDeprecation"))return t;var n=!1;return function(){if(!n){if(r("throwDeprecation"))throw new Error(e);r("traceDeprecation")?console.trace(e):console.warn(e),n=!0}return t.apply(this,arguments)}}}).call(this,r(7))},function(t,e,r){"use strict";t.exports=o;var n=r(42),i=r(14);function o(t){if(!(this instanceof o))return new o(t);n.call(this,t)}i.inherits=r(0),i.inherits(o,n),o.prototype._transform=function(t,e,r){r(null,t)}},function(t,e,r){t.exports=r(28)},function(t,e,r){t.exports=r(10)},function(t,e,r){t.exports=r(27).Transform},function(t,e,r){t.exports=r(27).PassThrough},function(t,e,r){var n=r(0),i=r(12),o=r(1).Buffer,a=[1518500249,1859775393,-1894007588,-899497514],f=new Array(80);function s(){this.init(),this._w=f,i.call(this,64,56)}function c(t){return t<<5|t>>>27}function u(t){return t<<30|t>>>2}function h(t,e,r,n){return 0===t?e&r|~e&n:2===t?e&r|e&n|r&n:e^r^n}n(s,i),s.prototype.init=function(){return this._a=1732584193,this._b=4023233417,this._c=2562383102,this._d=271733878,this._e=3285377520,this},s.prototype._update=function(t){for(var e=this._w,r=0|this._a,n=0|this._b,i=0|this._c,o=0|this._d,f=0|this._e,s=0;s<16;++s)e[s]=t.readInt32BE(4*s);for(;s<80;++s)e[s]=e[s-3]^e[s-8]^e[s-14]^e[s-16];for(var d=0;d<80;++d){var l=~~(d/20),p=c(r)+h(l,n,i,o)+f+e[d]+a[l]|0;f=o,o=i,i=u(n),n=r,r=p}this._a=r+this._a|0,this._b=n+this._b|0,this._c=i+this._c|0,this._d=o+this._d|0,this._e=f+this._e|0},s.prototype._hash=function(){var t=o.allocUnsafe(20);return t.writeInt32BE(0|this._a,0),t.writeInt32BE(0|this._b,4),t.writeInt32BE(0|this._c,8),t.writeInt32BE(0|this._d,12),t.writeInt32BE(0|this._e,16),t},t.exports=s},function(t,e,r){var n=r(0),i=r(12),o=r(1).Buffer,a=[1518500249,1859775393,-1894007588,-899497514],f=new Array(80);function s(){this.init(),this._w=f,i.call(this,64,56)}function c(t){return t<<1|t>>>31}function u(t){return t<<5|t>>>27}function h(t){return t<<30|t>>>2}function d(t,e,r,n){return 0===t?e&r|~e&n:2===t?e&r|e&n|r&n:e^r^n}n(s,i),s.prototype.init=function(){return this._a=1732584193,this._b=4023233417,this._c=2562383102,this._d=271733878,this._e=3285377520,this},s.prototype._update=function(t){for(var e=this._w,r=0|this._a,n=0|this._b,i=0|this._c,o=0|this._d,f=0|this._e,s=0;s<16;++s)e[s]=t.readInt32BE(4*s);for(;s<80;++s)e[s]=c(e[s-3]^e[s-8]^e[s-14]^e[s-16]);for(var l=0;l<80;++l){var p=~~(l/20),b=u(r)+d(p,n,i,o)+f+e[l]+a[p]|0;f=o,o=i,i=h(n),n=r,r=b}this._a=r+this._a|0,this._b=n+this._b|0,this._c=i+this._c|0,this._d=o+this._d|0,this._e=f+this._e|0},s.prototype._hash=function(){var t=o.allocUnsafe(20);return t.writeInt32BE(0|this._a,0),t.writeInt32BE(0|this._b,4),t.writeInt32BE(0|this._c,8),t.writeInt32BE(0|this._d,12),t.writeInt32BE(0|this._e,16),t},t.exports=s},function(t,e,r){var n=r(0),i=r(43),o=r(12),a=r(1).Buffer,f=new Array(64);function s(){this.init(),this._w=f,o.call(this,64,56)}n(s,i),s.prototype.init=function(){return this._a=3238371032,this._b=914150663,this._c=812702999,this._d=4144912697,this._e=4290775857,this._f=1750603025,this._g=1694076839,this._h=3204075428,this},s.prototype._hash=function(){var t=a.allocUnsafe(28);return t.writeInt32BE(this._a,0),t.writeInt32BE(this._b,4),t.writeInt32BE(this._c,8),t.writeInt32BE(this._d,12),t.writeInt32BE(this._e,16),t.writeInt32BE(this._f,20),t.writeInt32BE(this._g,24),t},t.exports=s},function(t,e,r){var n=r(0),i=r(44),o=r(12),a=r(1).Buffer,f=new Array(160);function s(){this.init(),this._w=f,o.call(this,128,112)}n(s,i),s.prototype.init=function(){return this._ah=3418070365,this._bh=1654270250,this._ch=2438529370,this._dh=355462360,this._eh=1731405415,this._fh=2394180231,this._gh=3675008525,this._hh=1203062813,this._al=3238371032,this._bl=914150663,this._cl=812702999,this._dl=4144912697,this._el=4290775857,this._fl=1750603025,this._gl=1694076839,this._hl=3204075428,this},s.prototype._hash=function(){var t=a.allocUnsafe(48);function e(e,r,n){t.writeInt32BE(e,n),t.writeInt32BE(r,n+4)}return e(this._ah,this._al,0),e(this._bh,this._bl,8),e(this._ch,this._cl,16),e(this._dh,this._dl,24),e(this._eh,this._el,32),e(this._fh,this._fl,40),t},t.exports=s},function(t,e,r){"use strict";var n=r(0),i=r(1).Buffer,o=r(9),a=i.alloc(128),f=64;function s(t,e){o.call(this,"digest"),"string"==typeof e&&(e=i.from(e)),this._alg=t,this._key=e,e.length>f?e=t(e):e.length<f&&(e=i.concat([e,a],f));for(var r=this._ipad=i.allocUnsafe(f),n=this._opad=i.allocUnsafe(f),s=0;s<f;s++)r[s]=54^e[s],n[s]=92^e[s];this._hash=[r]}n(s,o),s.prototype._update=function(t){this._hash.push(t)},s.prototype._final=function(){var t=this._alg(i.concat(this._hash));return this._alg(i.concat([this._opad,t]))},t.exports=s},function(t,e,r){t.exports=r(47)},function(t,e,r){(function(e,n){var i,o=r(49),a=r(50),f=r(51),s=r(1).Buffer,c=e.crypto&&e.crypto.subtle,u={sha:"SHA-1","sha-1":"SHA-1",sha1:"SHA-1",sha256:"SHA-256","sha-256":"SHA-256",sha384:"SHA-384","sha-384":"SHA-384","sha-512":"SHA-512",sha512:"SHA-512"},h=[];function d(t,e,r,n,i){return c.importKey("raw",t,{name:"PBKDF2"},!1,["deriveBits"]).then(function(t){return c.deriveBits({name:"PBKDF2",salt:e,iterations:r,hash:{name:i}},t,n<<3)}).then(function(t){return s.from(t)})}t.exports=function(t,r,l,p,b,y){"function"==typeof b&&(y=b,b=void 0);var v=u[(b=b||"sha1").toLowerCase()];if(!v||"function"!=typeof e.Promise)return n.nextTick(function(){var e;try{e=f(t,r,l,p,b)}catch(t){return y(t)}y(null,e)});if(o(t,r,l,p),"function"!=typeof y)throw new Error("No callback provided to pbkdf2");s.isBuffer(t)||(t=s.from(t,a)),s.isBuffer(r)||(r=s.from(r,a)),function(t,e){t.then(function(t){n.nextTick(function(){e(null,t)})},function(t){n.nextTick(function(){e(t)})})}(function(t){if(e.process&&!e.process.browser)return Promise.resolve(!1);if(!c||!c.importKey||!c.deriveBits)return Promise.resolve(!1);if(void 0!==h[t])return h[t];var r=d(i=i||s.alloc(8),i,10,128,t).then(function(){return!0}).catch(function(){return!1});return h[t]=r,r}(v).then(function(e){return e?d(t,r,l,p,v):f(t,r,l,p,b)}),y)}}).call(this,r(7),r(8))},function(t,e,r){var n=r(97),i=r(33),o=r(34),a=r(112),f=r(21);function s(t,e,r){if(t=t.toLowerCase(),o[t])return i.createCipheriv(t,e,r);if(a[t])return new n({key:e,iv:r,mode:t});throw new TypeError("invalid suite type")}function c(t,e,r){if(t=t.toLowerCase(),o[t])return i.createDecipheriv(t,e,r);if(a[t])return new n({key:e,iv:r,mode:t,decrypt:!0});throw new TypeError("invalid suite type")}e.createCipher=e.Cipher=function(t,e){var r,n;if(t=t.toLowerCase(),o[t])r=o[t].key,n=o[t].iv;else{if(!a[t])throw new TypeError("invalid suite type");r=8*a[t].key,n=a[t].iv}var i=f(e,!1,r,n);return s(t,i.key,i.iv)},e.createCipheriv=e.Cipheriv=s,e.createDecipher=e.Decipher=function(t,e){var r,n;if(t=t.toLowerCase(),o[t])r=o[t].key,n=o[t].iv;else{if(!a[t])throw new TypeError("invalid suite type");r=8*a[t].key,n=a[t].iv}var i=f(e,!1,r,n);return c(t,i.key,i.iv)},e.createDecipheriv=e.Decipheriv=c,e.listCiphers=e.getCiphers=function(){return Object.keys(a).concat(i.getCiphers())}},function(t,e,r){var n=r(9),i=r(32),o=r(0),a=r(1).Buffer,f={"des-ede3-cbc":i.CBC.instantiate(i.EDE),"des-ede3":i.EDE,"des-ede-cbc":i.CBC.instantiate(i.EDE),"des-ede":i.EDE,"des-cbc":i.CBC.instantiate(i.DES),"des-ecb":i.DES};function s(t){n.call(this);var e,r=t.mode.toLowerCase(),i=f[r];e=t.decrypt?"decrypt":"encrypt";var o=t.key;a.isBuffer(o)||(o=a.from(o)),"des-ede"!==r&&"des-ede-cbc"!==r||(o=a.concat([o,o.slice(0,8)]));var s=t.iv;a.isBuffer(s)||(s=a.from(s)),this._des=i.create({key:o,iv:s,type:e})}f.des=f["des-cbc"],f.des3=f["des-ede3-cbc"],t.exports=s,o(s,n),s.prototype._update=function(t){return a.from(this._des.update(t))},s.prototype._final=function(){return a.from(this._des.final())}},function(t,e,r){"use strict";e.readUInt32BE=function(t,e){return(t[0+e]<<24|t[1+e]<<16|t[2+e]<<8|t[3+e])>>>0},e.writeUInt32BE=function(t,e,r){t[0+r]=e>>>24,t[1+r]=e>>>16&255,t[2+r]=e>>>8&255,t[3+r]=255&e},e.ip=function(t,e,r,n){for(var i=0,o=0,a=6;a>=0;a-=2){for(var f=0;f<=24;f+=8)i<<=1,i|=e>>>f+a&1;for(f=0;f<=24;f+=8)i<<=1,i|=t>>>f+a&1}for(a=6;a>=0;a-=2){for(f=1;f<=25;f+=8)o<<=1,o|=e>>>f+a&1;for(f=1;f<=25;f+=8)o<<=1,o|=t>>>f+a&1}r[n+0]=i>>>0,r[n+1]=o>>>0},e.rip=function(t,e,r,n){for(var i=0,o=0,a=0;a<4;a++)for(var f=24;f>=0;f-=8)i<<=1,i|=e>>>f+a&1,i<<=1,i|=t>>>f+a&1;for(a=4;a<8;a++)for(f=24;f>=0;f-=8)o<<=1,o|=e>>>f+a&1,o<<=1,o|=t>>>f+a&1;r[n+0]=i>>>0,r[n+1]=o>>>0},e.pc1=function(t,e,r,n){for(var i=0,o=0,a=7;a>=5;a--){for(var f=0;f<=24;f+=8)i<<=1,i|=e>>f+a&1;for(f=0;f<=24;f+=8)i<<=1,i|=t>>f+a&1}for(f=0;f<=24;f+=8)i<<=1,i|=e>>f+a&1;for(a=1;a<=3;a++){for(f=0;f<=24;f+=8)o<<=1,o|=e>>f+a&1;for(f=0;f<=24;f+=8)o<<=1,o|=t>>f+a&1}for(f=0;f<=24;f+=8)o<<=1,o|=t>>f+a&1;r[n+0]=i>>>0,r[n+1]=o>>>0},e.r28shl=function(t,e){return t<<e&268435455|t>>>28-e};var n=[14,11,17,4,27,23,25,0,13,22,7,18,5,9,16,24,2,20,12,21,1,8,15,26,15,4,25,19,9,1,26,16,5,11,23,8,12,7,17,0,22,3,10,14,6,20,27,24];e.pc2=function(t,e,r,i){for(var o=0,a=0,f=n.length>>>1,s=0;s<f;s++)o<<=1,o|=t>>>n[s]&1;for(s=f;s<n.length;s++)a<<=1,a|=e>>>n[s]&1;r[i+0]=o>>>0,r[i+1]=a>>>0},e.expand=function(t,e,r){var n=0,i=0;n=(1&t)<<5|t>>>27;for(var o=23;o>=15;o-=4)n<<=6,n|=t>>>o&63;for(o=11;o>=3;o-=4)i|=t>>>o&63,i<<=6;i|=(31&t)<<1|t>>>31,e[r+0]=n>>>0,e[r+1]=i>>>0};var i=[14,0,4,15,13,7,1,4,2,14,15,2,11,13,8,1,3,10,10,6,6,12,12,11,5,9,9,5,0,3,7,8,4,15,1,12,14,8,8,2,13,4,6,9,2,1,11,7,15,5,12,11,9,3,7,14,3,10,10,0,5,6,0,13,15,3,1,13,8,4,14,7,6,15,11,2,3,8,4,14,9,12,7,0,2,1,13,10,12,6,0,9,5,11,10,5,0,13,14,8,7,10,11,1,10,3,4,15,13,4,1,2,5,11,8,6,12,7,6,12,9,0,3,5,2,14,15,9,10,13,0,7,9,0,14,9,6,3,3,4,15,6,5,10,1,2,13,8,12,5,7,14,11,12,4,11,2,15,8,1,13,1,6,10,4,13,9,0,8,6,15,9,3,8,0,7,11,4,1,15,2,14,12,3,5,11,10,5,14,2,7,12,7,13,13,8,14,11,3,5,0,6,6,15,9,0,10,3,1,4,2,7,8,2,5,12,11,1,12,10,4,14,15,9,10,3,6,15,9,0,0,6,12,10,11,1,7,13,13,8,15,9,1,4,3,5,14,11,5,12,2,7,8,2,4,14,2,14,12,11,4,2,1,12,7,4,10,7,11,13,6,1,8,5,5,0,3,15,15,10,13,3,0,9,14,8,9,6,4,11,2,8,1,12,11,7,10,1,13,14,7,2,8,13,15,6,9,15,12,0,5,9,6,10,3,4,0,5,14,3,12,10,1,15,10,4,15,2,9,7,2,12,6,9,8,5,0,6,13,1,3,13,4,14,14,0,7,11,5,3,11,8,9,4,14,3,15,2,5,12,2,9,8,5,12,15,3,10,7,11,0,14,4,1,10,7,1,6,13,0,11,8,6,13,4,13,11,0,2,11,14,7,15,4,0,9,8,1,13,10,3,14,12,3,9,5,7,12,5,2,10,15,6,8,1,6,1,6,4,11,11,13,13,8,12,1,3,4,7,10,14,7,10,9,15,5,6,0,8,15,0,14,5,2,9,3,2,12,13,1,2,15,8,13,4,8,6,10,15,3,11,7,1,4,10,12,9,5,3,6,14,11,5,0,0,14,12,9,7,2,7,2,11,1,4,14,1,7,9,4,12,10,14,8,2,13,0,15,6,12,10,9,13,0,15,3,3,5,5,6,8,11];e.substitute=function(t,e){for(var r=0,n=0;n<4;n++)r<<=4,r|=i[64*n+(t>>>18-6*n&63)];for(n=0;n<4;n++)r<<=4,r|=i[256+64*n+(e>>>18-6*n&63)];return r>>>0};var o=[16,25,12,11,3,20,4,15,31,17,9,6,27,14,1,22,30,24,8,18,0,5,29,23,13,19,2,26,10,21,28,7];e.permute=function(t){for(var e=0,r=0;r<o.length;r++)e<<=1,e|=t>>>o[r]&1;return e>>>0},e.padSplit=function(t,e,r){for(var n=t.toString(2);n.length<e;)n="0"+n;for(var i=[],o=0;o<e;o+=r)i.push(n.slice(o,o+r));return i.join(" ")}},function(t,e,r){"use strict";var n=r(5);function i(t){this.options=t,this.type=this.options.type,this.blockSize=8,this._init(),this.buffer=new Array(this.blockSize),this.bufferOff=0}t.exports=i,i.prototype._init=function(){},i.prototype.update=function(t){return 0===t.length?[]:"decrypt"===this.type?this._updateDecrypt(t):this._updateEncrypt(t)},i.prototype._buffer=function(t,e){for(var r=Math.min(this.buffer.length-this.bufferOff,t.length-e),n=0;n<r;n++)this.buffer[this.bufferOff+n]=t[e+n];return this.bufferOff+=r,r},i.prototype._flushBuffer=function(t,e){return this._update(this.buffer,0,t,e),this.bufferOff=0,this.blockSize},i.prototype._updateEncrypt=function(t){var e=0,r=0,n=(this.bufferOff+t.length)/this.blockSize|0,i=new Array(n*this.blockSize);0!==this.bufferOff&&(e+=this._buffer(t,e),this.bufferOff===this.buffer.length&&(r+=this._flushBuffer(i,r)));for(var o=t.length-(t.length-e)%this.blockSize;e<o;e+=this.blockSize)this._update(t,e,i,r),r+=this.blockSize;for(;e<t.length;e++,this.bufferOff++)this.buffer[this.bufferOff]=t[e];return i},i.prototype._updateDecrypt=function(t){for(var e=0,r=0,n=Math.ceil((this.bufferOff+t.length)/this.blockSize)-1,i=new Array(n*this.blockSize);n>0;n--)e+=this._buffer(t,e),r+=this._flushBuffer(i,r);return e+=this._buffer(t,e),i},i.prototype.final=function(t){var e,r;return t&&(e=this.update(t)),r="encrypt"===this.type?this._finalEncrypt():this._finalDecrypt(),e?e.concat(r):r},i.prototype._pad=function(t,e){if(0===e)return!1;for(;e<t.length;)t[e++]=0;return!0},i.prototype._finalEncrypt=function(){if(!this._pad(this.buffer,this.bufferOff))return[];var t=new Array(this.blockSize);return this._update(this.buffer,0,t,0),t},i.prototype._unpad=function(t){return t},i.prototype._finalDecrypt=function(){n.equal(this.bufferOff,this.blockSize,"Not enough data to decrypt");var t=new Array(this.blockSize);return this._flushBuffer(t,0),this._unpad(t)}},function(t,e,r){"use strict";var n=r(5),i=r(0),o=r(32),a=o.utils,f=o.Cipher;function s(t){f.call(this,t);var e=new function(){this.tmp=new Array(2),this.keys=null};this._desState=e,this.deriveKeys(e,t.key)}i(s,f),t.exports=s,s.create=function(t){return new s(t)};var c=[1,1,2,2,2,2,2,2,1,2,2,2,2,2,2,1];s.prototype.deriveKeys=function(t,e){t.keys=new Array(32),n.equal(e.length,this.blockSize,"Invalid key length");var r=a.readUInt32BE(e,0),i=a.readUInt32BE(e,4);a.pc1(r,i,t.tmp,0),r=t.tmp[0],i=t.tmp[1];for(var o=0;o<t.keys.length;o+=2){var f=c[o>>>1];r=a.r28shl(r,f),i=a.r28shl(i,f),a.pc2(r,i,t.keys,o)}},s.prototype._update=function(t,e,r,n){var i=this._desState,o=a.readUInt32BE(t,e),f=a.readUInt32BE(t,e+4);a.ip(o,f,i.tmp,0),o=i.tmp[0],f=i.tmp[1],"encrypt"===this.type?this._encrypt(i,o,f,i.tmp,0):this._decrypt(i,o,f,i.tmp,0),o=i.tmp[0],f=i.tmp[1],a.writeUInt32BE(r,o,n),a.writeUInt32BE(r,f,n+4)},s.prototype._pad=function(t,e){for(var r=t.length-e,n=e;n<t.length;n++)t[n]=r;return!0},s.prototype._unpad=function(t){for(var e=t[t.length-1],r=t.length-e;r<t.length;r++)n.equal(t[r],e);return t.slice(0,t.length-e)},s.prototype._encrypt=function(t,e,r,n,i){for(var o=e,f=r,s=0;s<t.keys.length;s+=2){var c=t.keys[s],u=t.keys[s+1];a.expand(f,t.tmp,0),c^=t.tmp[0],u^=t.tmp[1];var h=a.substitute(c,u),d=f;f=(o^a.permute(h))>>>0,o=d}a.rip(f,o,n,i)},s.prototype._decrypt=function(t,e,r,n,i){for(var o=r,f=e,s=t.keys.length-2;s>=0;s-=2){var c=t.keys[s],u=t.keys[s+1];a.expand(o,t.tmp,0),c^=t.tmp[0],u^=t.tmp[1];var h=a.substitute(c,u),d=o;o=(f^a.permute(h))>>>0,f=d}a.rip(o,f,n,i)}},function(t,e,r){"use strict";var n=r(5),i=r(0),o={};e.instantiate=function(t){function e(e){t.call(this,e),this._cbcInit()}i(e,t);for(var r=Object.keys(o),n=0;n<r.length;n++){var a=r[n];e.prototype[a]=o[a]}return e.create=function(t){return new e(t)},e},o._cbcInit=function(){var t=new function(t){n.equal(t.length,8,"Invalid IV length"),this.iv=new Array(8);for(var e=0;e<this.iv.length;e++)this.iv[e]=t[e]}(this.options.iv);this._cbcState=t},o._update=function(t,e,r,n){var i=this._cbcState,o=this.constructor.super_.prototype,a=i.iv;if("encrypt"===this.type){for(var f=0;f<this.blockSize;f++)a[f]^=t[e+f];for(o._update.call(this,a,0,r,n),f=0;f<this.blockSize;f++)a[f]=r[n+f]}else{for(o._update.call(this,t,e,r,n),f=0;f<this.blockSize;f++)r[n+f]^=a[f];for(f=0;f<this.blockSize;f++)a[f]=t[e+f]}}},function(t,e,r){"use strict";var n=r(5),i=r(0),o=r(32),a=o.Cipher,f=o.DES;function s(t){a.call(this,t);var e=new function(t,e){n.equal(e.length,24,"Invalid key length");var r=e.slice(0,8),i=e.slice(8,16),o=e.slice(16,24);this.ciphers="encrypt"===t?[f.create({type:"encrypt",key:r}),f.create({type:"decrypt",key:i}),f.create({type:"encrypt",key:o})]:[f.create({type:"decrypt",key:o}),f.create({type:"encrypt",key:i}),f.create({type:"decrypt",key:r})]}(this.type,this.options.key);this._edeState=e}i(s,a),t.exports=s,s.create=function(t){return new s(t)},s.prototype._update=function(t,e,r,n){var i=this._edeState;i.ciphers[0]._update(t,e,r,n),i.ciphers[1]._update(r,n,r,n),i.ciphers[2]._update(r,n,r,n)},s.prototype._pad=f.prototype._pad,s.prototype._unpad=f.prototype._unpad},function(t,e,r){var n=r(34),i=r(55),o=r(1).Buffer,a=r(56),f=r(9),s=r(20),c=r(21);function u(t,e,r){f.call(this),this._cache=new d,this._cipher=new s.AES(e),this._prev=o.from(r),this._mode=t,this._autopadding=!0}r(0)(u,f),u.prototype._update=function(t){var e,r;this._cache.add(t);for(var n=[];e=this._cache.get();)r=this._mode.encrypt(this,e),n.push(r);return o.concat(n)};var h=o.alloc(16,16);function d(){this.cache=o.allocUnsafe(0)}function l(t,e,r){var f=n[t.toLowerCase()];if(!f)throw new TypeError("invalid suite type");if("string"==typeof e&&(e=o.from(e)),e.length!==f.key/8)throw new TypeError("invalid key length "+e.length);if("string"==typeof r&&(r=o.from(r)),"GCM"!==f.mode&&r.length!==f.iv)throw new TypeError("invalid iv length "+r.length);return"stream"===f.type?new a(f.module,e,r):"auth"===f.type?new i(f.module,e,r):new u(f.module,e,r)}u.prototype._final=function(){var t=this._cache.flush();if(this._autopadding)return t=this._mode.encrypt(this,t),this._cipher.scrub(),t;if(!t.equals(h))throw this._cipher.scrub(),new Error("data not multiple of block length")},u.prototype.setAutoPadding=function(t){return this._autopadding=!!t,this},d.prototype.add=function(t){this.cache=o.concat([this.cache,t])},d.prototype.get=function(){if(this.cache.length>15){var t=this.cache.slice(0,16);return this.cache=this.cache.slice(16),t}return null},d.prototype.flush=function(){for(var t=16-this.cache.length,e=o.allocUnsafe(t),r=-1;++r<t;)e.writeUInt8(t,r);return o.concat([this.cache,e])},e.createCipheriv=l,e.createCipher=function(t,e){var r=n[t.toLowerCase()];if(!r)throw new TypeError("invalid suite type");var i=c(e,!1,r.key,r.iv);return l(t,i.key,i.iv)}},function(t,e){e.encrypt=function(t,e){return t._cipher.encryptBlock(e)},e.decrypt=function(t,e){return t._cipher.decryptBlock(e)}},function(t,e,r){var n=r(15);e.encrypt=function(t,e){var r=n(e,t._prev);return t._prev=t._cipher.encryptBlock(r),t._prev},e.decrypt=function(t,e){var r=t._prev;t._prev=e;var i=t._cipher.decryptBlock(e);return n(i,r)}},function(t,e,r){var n=r(1).Buffer,i=r(15);function o(t,e,r){var o=e.length,a=i(e,t._cache);return t._cache=t._cache.slice(o),t._prev=n.concat([t._prev,r?e:a]),a}e.encrypt=function(t,e,r){for(var i,a=n.allocUnsafe(0);e.length;){if(0===t._cache.length&&(t._cache=t._cipher.encryptBlock(t._prev),t._prev=n.allocUnsafe(0)),!(t._cache.length<=e.length)){a=n.concat([a,o(t,e,r)]);break}i=t._cache.length,a=n.concat([a,o(t,e.slice(0,i),r)]),e=e.slice(i)}return a}},function(t,e,r){var n=r(1).Buffer;function i(t,e,r){var i=t._cipher.encryptBlock(t._prev)[0]^e;return t._prev=n.concat([t._prev.slice(1),n.from([r?e:i])]),i}e.encrypt=function(t,e,r){for(var o=e.length,a=n.allocUnsafe(o),f=-1;++f<o;)a[f]=i(t,e[f],r);return a}},function(t,e,r){var n=r(1).Buffer;function i(t,e,r){for(var n,i,a,f=-1,s=0;++f<8;)n=t._cipher.encryptBlock(t._prev),i=e&1<<7-f?128:0,s+=(128&(a=n[0]^i))>>f%8,t._prev=o(t._prev,r?i:a);return s}function o(t,e){var r=t.length,i=-1,o=n.allocUnsafe(t.length);for(t=n.concat([t,n.from([e])]);++i<r;)o[i]=t[i]<<1|t[i+1]>>7;return o}e.encrypt=function(t,e,r){for(var o=e.length,a=n.allocUnsafe(o),f=-1;++f<o;)a[f]=i(t,e[f],r);return a}},function(t,e,r){(function(t){var n=r(15);function i(t){return t._prev=t._cipher.encryptBlock(t._prev),t._prev}e.encrypt=function(e,r){for(;e._cache.length<r.length;)e._cache=t.concat([e._cache,i(e)]);var o=e._cache.slice(0,r.length);return e._cache=e._cache.slice(r.length),n(r,o)}}).call(this,r(3).Buffer)},function(t,e,r){var n=r(1).Buffer,i=n.alloc(16,0);function o(t){var e=n.allocUnsafe(16);return e.writeUInt32BE(t[0]>>>0,0),e.writeUInt32BE(t[1]>>>0,4),e.writeUInt32BE(t[2]>>>0,8),e.writeUInt32BE(t[3]>>>0,12),e}function a(t){this.h=t,this.state=n.alloc(16,0),this.cache=n.allocUnsafe(0)}a.prototype.ghash=function(t){for(var e=-1;++e<t.length;)this.state[e]^=t[e];this._multiply()},a.prototype._multiply=function(){for(var t,e,r=function(t){return[t.readUInt32BE(0),t.readUInt32BE(4),t.readUInt32BE(8),t.readUInt32BE(12)]}(this.h),n=[0,0,0,0],i=-1;++i<128;){for(0!=(this.state[~~(i/8)]&1<<7-i%8)&&(n[0]^=r[0],n[1]^=r[1],n[2]^=r[2],n[3]^=r[3]),e=0!=(1&r[3]),t=3;t>0;t--)r[t]=r[t]>>>1|(1&r[t-1])<<31;r[0]=r[0]>>>1,e&&(r[0]=r[0]^225<<24)}this.state=o(n)},a.prototype.update=function(t){var e;for(this.cache=n.concat([this.cache,t]);this.cache.length>=16;)e=this.cache.slice(0,16),this.cache=this.cache.slice(16),this.ghash(e)},a.prototype.final=function(t,e){return this.cache.length&&this.ghash(n.concat([this.cache,i],16)),this.ghash(o([0,t,0,e])),this.state},t.exports=a},function(t,e,r){var n=r(55),i=r(1).Buffer,o=r(34),a=r(56),f=r(9),s=r(20),c=r(21);function u(t,e,r){f.call(this),this._cache=new h,this._last=void 0,this._cipher=new s.AES(e),this._prev=i.from(r),this._mode=t,this._autopadding=!0}function h(){this.cache=i.allocUnsafe(0)}function d(t,e,r){var f=o[t.toLowerCase()];if(!f)throw new TypeError("invalid suite type");if("string"==typeof r&&(r=i.from(r)),"GCM"!==f.mode&&r.length!==f.iv)throw new TypeError("invalid iv length "+r.length);if("string"==typeof e&&(e=i.from(e)),e.length!==f.key/8)throw new TypeError("invalid key length "+e.length);return"stream"===f.type?new a(f.module,e,r,!0):"auth"===f.type?new n(f.module,e,r,!0):new u(f.module,e,r)}r(0)(u,f),u.prototype._update=function(t){var e,r;this._cache.add(t);for(var n=[];e=this._cache.get(this._autopadding);)r=this._mode.decrypt(this,e),n.push(r);return i.concat(n)},u.prototype._final=function(){var t=this._cache.flush();if(this._autopadding)return function(t){var e=t[15];if(e<1||e>16)throw new Error("unable to decrypt data");for(var r=-1;++r<e;)if(t[r+(16-e)]!==e)throw new Error("unable to decrypt data");if(16!==e)return t.slice(0,16-e)}(this._mode.decrypt(this,t));if(t)throw new Error("data not multiple of block length")},u.prototype.setAutoPadding=function(t){return this._autopadding=!!t,this},h.prototype.add=function(t){this.cache=i.concat([this.cache,t])},h.prototype.get=function(t){var e;if(t){if(this.cache.length>16)return e=this.cache.slice(0,16),this.cache=this.cache.slice(16),e}else if(this.cache.length>=16)return e=this.cache.slice(0,16),this.cache=this.cache.slice(16),e;return null},h.prototype.flush=function(){if(this.cache.length)return this.cache},e.createDecipher=function(t,e){var r=o[t.toLowerCase()];if(!r)throw new TypeError("invalid suite type");var n=c(e,!1,r.key,r.iv);return d(t,n.key,n.iv)},e.createDecipheriv=d},function(t,e){e["des-ecb"]={key:8,iv:0},e["des-cbc"]=e.des={key:8,iv:8},e["des-ede3-cbc"]=e.des3={key:24,iv:8},e["des-ede3"]={key:24,iv:0},e["des-ede-cbc"]={key:16,iv:8},e["des-ede"]={key:16,iv:0}},function(t,e,r){(function(t){var n=r(57),i=r(117),o=r(118),a={binary:!0,hex:!0,base64:!0};e.DiffieHellmanGroup=e.createDiffieHellmanGroup=e.getDiffieHellman=function(e){var r=new t(i[e].prime,"hex"),n=new t(i[e].gen,"hex");return new o(r,n)},e.createDiffieHellman=e.DiffieHellman=function e(r,i,f,s){return t.isBuffer(i)||void 0===a[i]?e(r,"binary",i,f):(i=i||"binary",s=s||"binary",f=f||new t([2]),t.isBuffer(f)||(f=new t(f,s)),"number"==typeof r?new o(n(r,f),f,!0):(t.isBuffer(r)||(r=new t(r,i)),new o(r,f,!0)))}}).call(this,r(3).Buffer)},function(t,e){t.exports=function(t){return t.webpackPolyfill||(t.deprecate=function(){},t.paths=[],t.children||(t.children=[]),Object.defineProperty(t,"loaded",{enumerable:!0,get:function(){return t.l}}),Object.defineProperty(t,"id",{enumerable:!0,get:function(){return t.i}}),t.webpackPolyfill=1),t}},function(t,e){},function(t,e){},function(t){t.exports={modp1:{gen:"02",prime:"ffffffffffffffffc90fdaa22168c234c4c6628b80dc1cd129024e088a67cc74020bbea63b139b22514a08798e3404ddef9519b3cd3a431b302b0a6df25f14374fe1356d6d51c245e485b576625e7ec6f44c42e9a63a3620ffffffffffffffff"},modp2:{gen:"02",prime:"ffffffffffffffffc90fdaa22168c234c4c6628b80dc1cd129024e088a67cc74020bbea63b139b22514a08798e3404ddef9519b3cd3a431b302b0a6df25f14374fe1356d6d51c245e485b576625e7ec6f44c42e9a637ed6b0bff5cb6f406b7edee386bfb5a899fa5ae9f24117c4b1fe649286651ece65381ffffffffffffffff"},modp5:{gen:"02",prime:"ffffffffffffffffc90fdaa22168c234c4c6628b80dc1cd129024e088a67cc74020bbea63b139b22514a08798e3404ddef9519b3cd3a431b302b0a6df25f14374fe1356d6d51c245e485b576625e7ec6f44c42e9a637ed6b0bff5cb6f406b7edee386bfb5a899fa5ae9f24117c4b1fe649286651ece45b3dc2007cb8a163bf0598da48361c55d39a69163fa8fd24cf5f83655d23dca3ad961c62f356208552bb9ed529077096966d670c354e4abc9804f1746c08ca237327ffffffffffffffff"},modp14:{gen:"02",prime:"ffffffffffffffffc90fdaa22168c234c4c6628b80dc1cd129024e088a67cc74020bbea63b139b22514a08798e3404ddef9519b3cd3a431b302b0a6df25f14374fe1356d6d51c245e485b576625e7ec6f44c42e9a637ed6b0bff5cb6f406b7edee386bfb5a899fa5ae9f24117c4b1fe649286651ece45b3dc2007cb8a163bf0598da48361c55d39a69163fa8fd24cf5f83655d23dca3ad961c62f356208552bb9ed529077096966d670c354e4abc9804f1746c08ca18217c32905e462e36ce3be39e772c180e86039b2783a2ec07a28fb5c55df06f4c52c9de2bcbf6955817183995497cea956ae515d2261898fa051015728e5a8aacaa68ffffffffffffffff"},modp15:{gen:"02",prime:"ffffffffffffffffc90fdaa22168c234c4c6628b80dc1cd129024e088a67cc74020bbea63b139b22514a08798e3404ddef9519b3cd3a431b302b0a6df25f14374fe1356d6d51c245e485b576625e7ec6f44c42e9a637ed6b0bff5cb6f406b7edee386bfb5a899fa5ae9f24117c4b1fe649286651ece45b3dc2007cb8a163bf0598da48361c55d39a69163fa8fd24cf5f83655d23dca3ad961c62f356208552bb9ed529077096966d670c354e4abc9804f1746c08ca18217c32905e462e36ce3be39e772c180e86039b2783a2ec07a28fb5c55df06f4c52c9de2bcbf6955817183995497cea956ae515d2261898fa051015728e5a8aaac42dad33170d04507a33a85521abdf1cba64ecfb850458dbef0a8aea71575d060c7db3970f85a6e1e4c7abf5ae8cdb0933d71e8c94e04a25619dcee3d2261ad2ee6bf12ffa06d98a0864d87602733ec86a64521f2b18177b200cbbe117577a615d6c770988c0bad946e208e24fa074e5ab3143db5bfce0fd108e4b82d120a93ad2caffffffffffffffff"},modp16:{gen:"02",prime:"ffffffffffffffffc90fdaa22168c234c4c6628b80dc1cd129024e088a67cc74020bbea63b139b22514a08798e3404ddef9519b3cd3a431b302b0a6df25f14374fe1356d6d51c245e485b576625e7ec6f44c42e9a637ed6b0bff5cb6f406b7edee386bfb5a899fa5ae9f24117c4b1fe649286651ece45b3dc2007cb8a163bf0598da48361c55d39a69163fa8fd24cf5f83655d23dca3ad961c62f356208552bb9ed529077096966d670c354e4abc9804f1746c08ca18217c32905e462e36ce3be39e772c180e86039b2783a2ec07a28fb5c55df06f4c52c9de2bcbf6955817183995497cea956ae515d2261898fa051015728e5a8aaac42dad33170d04507a33a85521abdf1cba64ecfb850458dbef0a8aea71575d060c7db3970f85a6e1e4c7abf5ae8cdb0933d71e8c94e04a25619dcee3d2261ad2ee6bf12ffa06d98a0864d87602733ec86a64521f2b18177b200cbbe117577a615d6c770988c0bad946e208e24fa074e5ab3143db5bfce0fd108e4b82d120a92108011a723c12a787e6d788719a10bdba5b2699c327186af4e23c1a946834b6150bda2583e9ca2ad44ce8dbbbc2db04de8ef92e8efc141fbecaa6287c59474e6bc05d99b2964fa090c3a2233ba186515be7ed1f612970cee2d7afb81bdd762170481cd0069127d5b05aa993b4ea988d8fddc186ffb7dc90a6c08f4df435c934063199ffffffffffffffff"},modp17:{gen:"02",prime:"ffffffffffffffffc90fdaa22168c234c4c6628b80dc1cd129024e088a67cc74020bbea63b139b22514a08798e3404ddef9519b3cd3a431b302b0a6df25f14374fe1356d6d51c245e485b576625e7ec6f44c42e9a637ed6b0bff5cb6f406b7edee386bfb5a899fa5ae9f24117c4b1fe649286651ece45b3dc2007cb8a163bf0598da48361c55d39a69163fa8fd24cf5f83655d23dca3ad961c62f356208552bb9ed529077096966d670c354e4abc9804f1746c08ca18217c32905e462e36ce3be39e772c180e86039b2783a2ec07a28fb5c55df06f4c52c9de2bcbf6955817183995497cea956ae515d2261898fa051015728e5a8aaac42dad33170d04507a33a85521abdf1cba64ecfb850458dbef0a8aea71575d060c7db3970f85a6e1e4c7abf5ae8cdb0933d71e8c94e04a25619dcee3d2261ad2ee6bf12ffa06d98a0864d87602733ec86a64521f2b18177b200cbbe117577a615d6c770988c0bad946e208e24fa074e5ab3143db5bfce0fd108e4b82d120a92108011a723c12a787e6d788719a10bdba5b2699c327186af4e23c1a946834b6150bda2583e9ca2ad44ce8dbbbc2db04de8ef92e8efc141fbecaa6287c59474e6bc05d99b2964fa090c3a2233ba186515be7ed1f612970cee2d7afb81bdd762170481cd0069127d5b05aa993b4ea988d8fddc186ffb7dc90a6c08f4df435c93402849236c3fab4d27c7026c1d4dcb2602646dec9751e763dba37bdf8ff9406ad9e530ee5db382f413001aeb06a53ed9027d831179727b0865a8918da3edbebcf9b14ed44ce6cbaced4bb1bdb7f1447e6cc254b332051512bd7af426fb8f401378cd2bf5983ca01c64b92ecf032ea15d1721d03f482d7ce6e74fef6d55e702f46980c82b5a84031900b1c9e59e7c97fbec7e8f323a97a7e36cc88be0f1d45b7ff585ac54bd407b22b4154aacc8f6d7ebf48e1d814cc5ed20f8037e0a79715eef29be32806a1d58bb7c5da76f550aa3d8a1fbff0eb19ccb1a313d55cda56c9ec2ef29632387fe8d76e3c0468043e8f663f4860ee12bf2d5b0b7474d6e694f91e6dcc4024ffffffffffffffff"},modp18:{gen:"02",prime:"ffffffffffffffffc90fdaa22168c234c4c6628b80dc1cd129024e088a67cc74020bbea63b139b22514a08798e3404ddef9519b3cd3a431b302b0a6df25f14374fe1356d6d51c245e485b576625e7ec6f44c42e9a637ed6b0bff5cb6f406b7edee386bfb5a899fa5ae9f24117c4b1fe649286651ece45b3dc2007cb8a163bf0598da48361c55d39a69163fa8fd24cf5f83655d23dca3ad961c62f356208552bb9ed529077096966d670c354e4abc9804f1746c08ca18217c32905e462e36ce3be39e772c180e86039b2783a2ec07a28fb5c55df06f4c52c9de2bcbf6955817183995497cea956ae515d2261898fa051015728e5a8aaac42dad33170d04507a33a85521abdf1cba64ecfb850458dbef0a8aea71575d060c7db3970f85a6e1e4c7abf5ae8cdb0933d71e8c94e04a25619dcee3d2261ad2ee6bf12ffa06d98a0864d87602733ec86a64521f2b18177b200cbbe117577a615d6c770988c0bad946e208e24fa074e5ab3143db5bfce0fd108e4b82d120a92108011a723c12a787e6d788719a10bdba5b2699c327186af4e23c1a946834b6150bda2583e9ca2ad44ce8dbbbc2db04de8ef92e8efc141fbecaa6287c59474e6bc05d99b2964fa090c3a2233ba186515be7ed1f612970cee2d7afb81bdd762170481cd0069127d5b05aa993b4ea988d8fddc186ffb7dc90a6c08f4df435c93402849236c3fab4d27c7026c1d4dcb2602646dec9751e763dba37bdf8ff9406ad9e530ee5db382f413001aeb06a53ed9027d831179727b0865a8918da3edbebcf9b14ed44ce6cbaced4bb1bdb7f1447e6cc254b332051512bd7af426fb8f401378cd2bf5983ca01c64b92ecf032ea15d1721d03f482d7ce6e74fef6d55e702f46980c82b5a84031900b1c9e59e7c97fbec7e8f323a97a7e36cc88be0f1d45b7ff585ac54bd407b22b4154aacc8f6d7ebf48e1d814cc5ed20f8037e0a79715eef29be32806a1d58bb7c5da76f550aa3d8a1fbff0eb19ccb1a313d55cda56c9ec2ef29632387fe8d76e3c0468043e8f663f4860ee12bf2d5b0b7474d6e694f91e6dbe115974a3926f12fee5e438777cb6a932df8cd8bec4d073b931ba3bc832b68d9dd300741fa7bf8afc47ed2576f6936ba424663aab639c5ae4f5683423b4742bf1c978238f16cbe39d652de3fdb8befc848ad922222e04a4037c0713eb57a81a23f0c73473fc646cea306b4bcbc8862f8385ddfa9d4b7fa2c087e879683303ed5bdd3a062b3cf5b3a278a66d2a13f83f44f82ddf310ee074ab6a364597e899a0255dc164f31cc50846851df9ab48195ded7ea1b1d510bd7ee74d73faf36bc31ecfa268359046f4eb879f924009438b481c6cd7889a002ed5ee382bc9190da6fc026e479558e4475677e9aa9e3050e2765694dfc81f56e880b96e7160c980dd98edd3dfffffffffffffffff"}}},function(t,e,r){(function(e){var n=r(2),i=new(r(58)),o=new n(24),a=new n(11),f=new n(10),s=new n(3),c=new n(7),u=r(57),h=r(11);function d(t,r){return r=r||"utf8",e.isBuffer(t)||(t=new e(t,r)),this._pub=new n(t),this}function l(t,r){return r=r||"utf8",e.isBuffer(t)||(t=new e(t,r)),this._priv=new n(t),this}t.exports=b;var p={};function b(t,e,r){this.setGenerator(e),this.__prime=new n(t),this._prime=n.mont(this.__prime),this._primeLen=t.length,this._pub=void 0,this._priv=void 0,this._primeCode=void 0,r?(this.setPublicKey=d,this.setPrivateKey=l):this._primeCode=8}function y(t,r){var n=new e(t.toArray());return r?n.toString(r):n}Object.defineProperty(b.prototype,"verifyError",{enumerable:!0,get:function(){return"number"!=typeof this._primeCode&&(this._primeCode=function(t,e){var r=e.toString("hex"),n=[r,t.toString(16)].join("_");if(n in p)return p[n];var h,d=0;if(t.isEven()||!u.simpleSieve||!u.fermatTest(t)||!i.test(t))return d+=1,d+="02"===r||"05"===r?8:4,p[n]=d,d;switch(i.test(t.shrn(1))||(d+=2),r){case"02":t.mod(o).cmp(a)&&(d+=8);break;case"05":(h=t.mod(f)).cmp(s)&&h.cmp(c)&&(d+=8);break;default:d+=4}return p[n]=d,d}(this.__prime,this.__gen)),this._primeCode}}),b.prototype.generateKeys=function(){return this._priv||(this._priv=new n(h(this._primeLen))),this._pub=this._gen.toRed(this._prime).redPow(this._priv).fromRed(),this.getPublicKey()},b.prototype.computeSecret=function(t){var r=(t=(t=new n(t)).toRed(this._prime)).redPow(this._priv).fromRed(),i=new e(r.toArray()),o=this.getPrime();if(i.length<o.length){var a=new e(o.length-i.length);a.fill(0),i=e.concat([a,i])}return i},b.prototype.getPublicKey=function(t){return y(this._pub,t)},b.prototype.getPrivateKey=function(t){return y(this._priv,t)},b.prototype.getPrime=function(t){return y(this.__prime,t)},b.prototype.getGenerator=function(t){return y(this._gen,t)},b.prototype.setGenerator=function(t,r){return r=r||"utf8",e.isBuffer(t)||(t=new e(t,r)),this.__gen=t,this._gen=new n(t),this}}).call(this,r(3).Buffer)},function(t,e,r){(function(e){var n=r(13),i=r(25),o=r(0),a=r(120),f=r(156),s=r(47);function c(t){i.Writable.call(this);var e=s[t];if(!e)throw new Error("Unknown message digest");this._hashType=e.hash,this._hash=n(e.hash),this._tag=e.id,this._signType=e.sign}function u(t){i.Writable.call(this);var e=s[t];if(!e)throw new Error("Unknown message digest");this._hash=n(e.hash),this._tag=e.id,this._signType=e.sign}function h(t){return new c(t)}function d(t){return new u(t)}Object.keys(s).forEach(function(t){s[t].id=new e(s[t].id,"hex"),s[t.toLowerCase()]=s[t]}),o(c,i.Writable),c.prototype._write=function(t,e,r){this._hash.update(t),r()},c.prototype.update=function(t,r){return"string"==typeof t&&(t=new e(t,r)),this._hash.update(t),this},c.prototype.sign=function(t,e){this.end();var r=this._hash.digest(),n=a(r,t,this._hashType,this._signType,this._tag);return e?n.toString(e):n},o(u,i.Writable),u.prototype._write=function(t,e,r){this._hash.update(t),r()},u.prototype.update=function(t,r){return"string"==typeof t&&(t=new e(t,r)),this._hash.update(t),this},u.prototype.verify=function(t,r,n){"string"==typeof r&&(r=new e(r,n)),this.end();var i=this._hash.digest();return f(r,i,t,this._signType,this._tag)},t.exports={Sign:h,Verify:d,createSign:h,createVerify:d}}).call(this,r(3).Buffer)},function(t,e,r){(function(e){var n=r(45),i=r(35),o=r(4).ec,a=r(2),f=r(23),s=r(68);function c(t,r,i,o){if((t=new e(t.toArray())).length<r.byteLength()){var a=new e(r.byteLength()-t.length);a.fill(0),t=e.concat([a,t])}var f=i.length,s=function(t,r){t=(t=u(t,r)).mod(r);var n=new e(t.toArray());if(n.length<r.byteLength()){var i=new e(r.byteLength()-n.length);i.fill(0),n=e.concat([i,n])}return n}(i,r),c=new e(f);c.fill(1);var h=new e(f);return h.fill(0),h=n(o,h).update(c).update(new e([0])).update(t).update(s).digest(),c=n(o,h).update(c).digest(),{k:h=n(o,h).update(c).update(new e([1])).update(t).update(s).digest(),v:c=n(o,h).update(c).digest()}}function u(t,e){var r=new a(t),n=(t.length<<3)-e.bitLength();return n>0&&r.ishrn(n),r}function h(t,r,i){var o,a;do{for(o=new e(0);8*o.length<t.bitLength();)r.v=n(i,r.k).update(r.v).digest(),o=e.concat([o,r.v]);a=u(o,t),r.k=n(i,r.k).update(r.v).update(new e([0])).digest(),r.v=n(i,r.k).update(r.v).digest()}while(-1!==a.cmp(t));return a}function d(t,e,r,n){return t.toRed(a.mont(r)).redPow(e).fromRed().mod(n)}t.exports=function(t,r,n,l,p){var b=f(r);if(b.curve){if("ecdsa"!==l&&"ecdsa/rsa"!==l)throw new Error("wrong private key type");return function(t,r){var n=s[r.curve.join(".")];if(!n)throw new Error("unknown curve "+r.curve.join("."));var i=new o(n).keyFromPrivate(r.privateKey).sign(t);return new e(i.toDER())}(t,b)}if("dsa"===b.type){if("dsa"!==l)throw new Error("wrong private key type");return function(t,r,n){for(var i,o=r.params.priv_key,f=r.params.p,s=r.params.q,l=r.params.g,p=new a(0),b=u(t,s).mod(s),y=!1,v=c(o,s,t,n);!1===y;)p=d(l,i=h(s,v,n),f,s),0===(y=i.invm(s).imul(b.add(o.mul(p))).mod(s)).cmpn(0)&&(y=!1,p=new a(0));return function(t,r){t=t.toArray(),r=r.toArray(),128&t[0]&&(t=[0].concat(t)),128&r[0]&&(r=[0].concat(r));var n=[48,t.length+r.length+4,2,t.length];return n=n.concat(t,[2,r.length],r),new e(n)}(p,y)}(t,b,n)}if("rsa"!==l&&"ecdsa/rsa"!==l)throw new Error("wrong private key type");t=e.concat([p,t]);for(var y=b.modulus.byteLength(),v=[0,1];t.length+v.length+1<y;)v.push(255);v.push(0);for(var g=-1;++g<t.length;)v.push(t[g]);return i(v,b)},t.exports.getKey=c,t.exports.makeKey=h}).call(this,r(3).Buffer)},function(t){t.exports={_from:"elliptic@^6.0.0",_id:"elliptic@6.4.1",_inBundle:!1,_integrity:"sha512-BsXLz5sqX8OHcsh7CqBMztyXARmGQ3LWPtGjJi6DiJHq5C/qvi9P3OqgswKSDftbu8+IoI/QDTAm2fFnQ9SZSQ==",_location:"/elliptic",_phantomChildren:{},_requested:{type:"range",registry:!0,raw:"elliptic@^6.0.0",name:"elliptic",escapedName:"elliptic",rawSpec:"^6.0.0",saveSpec:null,fetchSpec:"^6.0.0"},_requiredBy:["/browserify-sign","/create-ecdh"],_resolved:"https://registry.npmjs.org/elliptic/-/elliptic-6.4.1.tgz",_shasum:"c2d0b7776911b86722c632c3c06c60f2f819939a",_spec:"elliptic@^6.0.0",_where:"/Users/pedrogomes/_walletconnect/walletconnect-monorepo/packages/walletconnect/node_modules/browserify-sign",author:{name:"Fedor Indutny",email:"fedor@indutny.com"},bugs:{url:"https://github.com/indutny/elliptic/issues"},bundleDependencies:!1,dependencies:{"bn.js":"^4.4.0",brorand:"^1.0.1","hash.js":"^1.0.0","hmac-drbg":"^1.0.0",inherits:"^2.0.1","minimalistic-assert":"^1.0.0","minimalistic-crypto-utils":"^1.0.0"},deprecated:!1,description:"EC cryptography",devDependencies:{brfs:"^1.4.3",coveralls:"^2.11.3",grunt:"^0.4.5","grunt-browserify":"^5.0.0","grunt-cli":"^1.2.0","grunt-contrib-connect":"^1.0.0","grunt-contrib-copy":"^1.0.0","grunt-contrib-uglify":"^1.0.1","grunt-mocha-istanbul":"^3.0.1","grunt-saucelabs":"^8.6.2",istanbul:"^0.4.2",jscs:"^2.9.0",jshint:"^2.6.0",mocha:"^2.1.0"},files:["lib"],homepage:"https://github.com/indutny/elliptic",keywords:["EC","Elliptic","curve","Cryptography"],license:"MIT",main:"lib/elliptic.js",name:"elliptic",repository:{type:"git",url:"git+ssh://git@github.com/indutny/elliptic.git"},scripts:{jscs:"jscs benchmarks/*.js lib/*.js lib/**/*.js lib/**/**/*.js test/index.js",jshint:"jscs benchmarks/*.js lib/*.js lib/**/*.js lib/**/**/*.js test/index.js",lint:"npm run jscs && npm run jshint",test:"npm run lint && npm run unit",unit:"istanbul test _mocha --reporter=spec test/index.js",version:"grunt dist && git add dist/"},version:"6.4.1"}},function(t,e,r){"use strict";var n=e,i=r(2),o=r(5),a=r(60);n.assert=o,n.toArray=a.toArray,n.zero2=a.zero2,n.toHex=a.toHex,n.encode=a.encode,n.getNAF=function(t,e){for(var r=[],n=1<<e+1,i=t.clone();i.cmpn(1)>=0;){var o;if(i.isOdd()){var a=i.andln(n-1);o=a>(n>>1)-1?(n>>1)-a:a,i.isubn(o)}else o=0;r.push(o);for(var f=0!==i.cmpn(0)&&0===i.andln(n-1)?e+1:1,s=1;s<f;s++)r.push(0);i.iushrn(f)}return r},n.getJSF=function(t,e){var r=[[],[]];t=t.clone(),e=e.clone();for(var n=0,i=0;t.cmpn(-n)>0||e.cmpn(-i)>0;){var o,a,f,s=t.andln(3)+n&3,c=e.andln(3)+i&3;3===s&&(s=-1),3===c&&(c=-1),o=0==(1&s)?0:3!=(f=t.andln(7)+n&7)&&5!==f||2!==c?s:-s,r[0].push(o),a=0==(1&c)?0:3!=(f=e.andln(7)+i&7)&&5!==f||2!==s?c:-c,r[1].push(a),2*n===o+1&&(n=1-n),2*i===a+1&&(i=1-i),t.iushrn(1),e.iushrn(1)}return r},n.cachedProperty=function(t,e,r){var n="_"+e;t.prototype[e]=function(){return void 0!==this[n]?this[n]:this[n]=r.call(this)}},n.parseBytes=function(t){return"string"==typeof t?n.toArray(t,"hex"):t},n.intFromLE=function(t){return new i(t,"hex","le")}},function(t,e,r){"use strict";var n=r(2),i=r(4).utils,o=i.getNAF,a=i.getJSF,f=i.assert;function s(t,e){this.type=t,this.p=new n(e.p,16),this.red=e.prime?n.red(e.prime):n.mont(this.p),this.zero=new n(0).toRed(this.red),this.one=new n(1).toRed(this.red),this.two=new n(2).toRed(this.red),this.n=e.n&&new n(e.n,16),this.g=e.g&&this.pointFromJSON(e.g,e.gRed),this._wnafT1=new Array(4),this._wnafT2=new Array(4),this._wnafT3=new Array(4),this._wnafT4=new Array(4);var r=this.n&&this.p.div(this.n);!r||r.cmpn(100)>0?this.redN=null:(this._maxwellTrick=!0,this.redN=this.n.toRed(this.red))}function c(t,e){this.curve=t,this.type=e,this.precomputed=null}t.exports=s,s.prototype.point=function(){throw new Error("Not implemented")},s.prototype.validate=function(){throw new Error("Not implemented")},s.prototype._fixedNafMul=function(t,e){f(t.precomputed);var r=t._getDoubles(),n=o(e,1),i=(1<<r.step+1)-(r.step%2==0?2:1);i/=3;for(var a=[],s=0;s<n.length;s+=r.step){var c=0;for(e=s+r.step-1;e>=s;e--)c=(c<<1)+n[e];a.push(c)}for(var u=this.jpoint(null,null,null),h=this.jpoint(null,null,null),d=i;d>0;d--){for(s=0;s<a.length;s++)(c=a[s])===d?h=h.mixedAdd(r.points[s]):c===-d&&(h=h.mixedAdd(r.points[s].neg()));u=u.add(h)}return u.toP()},s.prototype._wnafMul=function(t,e){var r=4,n=t._getNAFPoints(r);r=n.wnd;for(var i=n.points,a=o(e,r),s=this.jpoint(null,null,null),c=a.length-1;c>=0;c--){for(e=0;c>=0&&0===a[c];c--)e++;if(c>=0&&e++,s=s.dblp(e),c<0)break;var u=a[c];f(0!==u),s="affine"===t.type?u>0?s.mixedAdd(i[u-1>>1]):s.mixedAdd(i[-u-1>>1].neg()):u>0?s.add(i[u-1>>1]):s.add(i[-u-1>>1].neg())}return"affine"===t.type?s.toP():s},s.prototype._wnafMulAdd=function(t,e,r,n,i){for(var f=this._wnafT1,s=this._wnafT2,c=this._wnafT3,u=0,h=0;h<n;h++){var d=(A=e[h])._getNAFPoints(t);f[h]=d.wnd,s[h]=d.points}for(h=n-1;h>=1;h-=2){var l=h-1,p=h;if(1===f[l]&&1===f[p]){var b=[e[l],null,null,e[p]];0===e[l].y.cmp(e[p].y)?(b[1]=e[l].add(e[p]),b[2]=e[l].toJ().mixedAdd(e[p].neg())):0===e[l].y.cmp(e[p].y.redNeg())?(b[1]=e[l].toJ().mixedAdd(e[p]),b[2]=e[l].add(e[p].neg())):(b[1]=e[l].toJ().mixedAdd(e[p]),b[2]=e[l].toJ().mixedAdd(e[p].neg()));var y=[-3,-1,-5,-7,0,7,5,1,3],v=a(r[l],r[p]);u=Math.max(v[0].length,u),c[l]=new Array(u),c[p]=new Array(u);for(var g=0;g<u;g++){var m=0|v[0][g],_=0|v[1][g];c[l][g]=y[3*(m+1)+(_+1)],c[p][g]=0,s[l]=b}}else c[l]=o(r[l],f[l]),c[p]=o(r[p],f[p]),u=Math.max(c[l].length,u),u=Math.max(c[p].length,u)}var w=this.jpoint(null,null,null),S=this._wnafT4;for(h=u;h>=0;h--){for(var E=0;h>=0;){var M=!0;for(g=0;g<n;g++)S[g]=0|c[g][h],0!==S[g]&&(M=!1);if(!M)break;E++,h--}if(h>=0&&E++,w=w.dblp(E),h<0)break;for(g=0;g<n;g++){var A,x=S[g];0!==x&&(x>0?A=s[g][x-1>>1]:x<0&&(A=s[g][-x-1>>1].neg()),w="affine"===A.type?w.mixedAdd(A):w.add(A))}}for(h=0;h<n;h++)s[h]=null;return i?w:w.toP()},s.BasePoint=c,c.prototype.eq=function(){throw new Error("Not implemented")},c.prototype.validate=function(){return this.curve.validate(this)},s.prototype.decodePoint=function(t,e){t=i.toArray(t,e);var r=this.p.byteLength();if((4===t[0]||6===t[0]||7===t[0])&&t.length-1==2*r)return 6===t[0]?f(t[t.length-1]%2==0):7===t[0]&&f(t[t.length-1]%2==1),this.point(t.slice(1,1+r),t.slice(1+r,1+2*r));if((2===t[0]||3===t[0])&&t.length-1===r)return this.pointFromX(t.slice(1,1+r),3===t[0]);throw new Error("Unknown point format")},c.prototype.encodeCompressed=function(t){return this.encode(t,!0)},c.prototype._encode=function(t){var e=this.curve.p.byteLength(),r=this.getX().toArray("be",e);return t?[this.getY().isEven()?2:3].concat(r):[4].concat(r,this.getY().toArray("be",e))},c.prototype.encode=function(t,e){return i.encode(this._encode(e),t)},c.prototype.precompute=function(t){if(this.precomputed)return this;var e={doubles:null,naf:null,beta:null};return e.naf=this._getNAFPoints(8),e.doubles=this._getDoubles(4,t),e.beta=this._getBeta(),this.precomputed=e,this},c.prototype._hasDoubles=function(t){if(!this.precomputed)return!1;var e=this.precomputed.doubles;return!!e&&e.points.length>=Math.ceil((t.bitLength()+1)/e.step)},c.prototype._getDoubles=function(t,e){if(this.precomputed&&this.precomputed.doubles)return this.precomputed.doubles;for(var r=[this],n=this,i=0;i<e;i+=t){for(var o=0;o<t;o++)n=n.dbl();r.push(n)}return{step:t,points:r}},c.prototype._getNAFPoints=function(t){if(this.precomputed&&this.precomputed.naf)return this.precomputed.naf;for(var e=[this],r=(1<<t)-1,n=1===r?null:this.dbl(),i=1;i<r;i++)e[i]=e[i-1].add(n);return{wnd:t,points:e}},c.prototype._getBeta=function(){return null},c.prototype.dblp=function(t){for(var e=this,r=0;r<t;r++)e=e.dbl();return e}},function(t,e,r){"use strict";var n=r(22),i=r(4),o=r(2),a=r(0),f=n.base,s=i.utils.assert;function c(t){f.call(this,"short",t),this.a=new o(t.a,16).toRed(this.red),this.b=new o(t.b,16).toRed(this.red),this.tinv=this.two.redInvm(),this.zeroA=0===this.a.fromRed().cmpn(0),this.threeA=0===this.a.fromRed().sub(this.p).cmpn(-3),this.endo=this._getEndomorphism(t),this._endoWnafT1=new Array(4),this._endoWnafT2=new Array(4)}function u(t,e,r,n){f.BasePoint.call(this,t,"affine"),null===e&&null===r?(this.x=null,this.y=null,this.inf=!0):(this.x=new o(e,16),this.y=new o(r,16),n&&(this.x.forceRed(this.curve.red),this.y.forceRed(this.curve.red)),this.x.red||(this.x=this.x.toRed(this.curve.red)),this.y.red||(this.y=this.y.toRed(this.curve.red)),this.inf=!1)}function h(t,e,r,n){f.BasePoint.call(this,t,"jacobian"),null===e&&null===r&&null===n?(this.x=this.curve.one,this.y=this.curve.one,this.z=new o(0)):(this.x=new o(e,16),this.y=new o(r,16),this.z=new o(n,16)),this.x.red||(this.x=this.x.toRed(this.curve.red)),this.y.red||(this.y=this.y.toRed(this.curve.red)),this.z.red||(this.z=this.z.toRed(this.curve.red)),this.zOne=this.z===this.curve.one}a(c,f),t.exports=c,c.prototype._getEndomorphism=function(t){if(this.zeroA&&this.g&&this.n&&1===this.p.modn(3)){var e,r;if(t.beta)e=new o(t.beta,16).toRed(this.red);else{var n=this._getEndoRoots(this.p);e=(e=n[0].cmp(n[1])<0?n[0]:n[1]).toRed(this.red)}if(t.lambda)r=new o(t.lambda,16);else{var i=this._getEndoRoots(this.n);0===this.g.mul(i[0]).x.cmp(this.g.x.redMul(e))?r=i[0]:(r=i[1],s(0===this.g.mul(r).x.cmp(this.g.x.redMul(e))))}return{beta:e,lambda:r,basis:t.basis?t.basis.map(function(t){return{a:new o(t.a,16),b:new o(t.b,16)}}):this._getEndoBasis(r)}}},c.prototype._getEndoRoots=function(t){var e=t===this.p?this.red:o.mont(t),r=new o(2).toRed(e).redInvm(),n=r.redNeg(),i=new o(3).toRed(e).redNeg().redSqrt().redMul(r);return[n.redAdd(i).fromRed(),n.redSub(i).fromRed()]},c.prototype._getEndoBasis=function(t){for(var e,r,n,i,a,f,s,c,u,h=this.n.ushrn(Math.floor(this.n.bitLength()/2)),d=t,l=this.n.clone(),p=new o(1),b=new o(0),y=new o(0),v=new o(1),g=0;0!==d.cmpn(0);){var m=l.div(d);c=l.sub(m.mul(d)),u=y.sub(m.mul(p));var _=v.sub(m.mul(b));if(!n&&c.cmp(h)<0)e=s.neg(),r=p,n=c.neg(),i=u;else if(n&&2==++g)break;s=c,l=d,d=c,y=p,p=u,v=b,b=_}a=c.neg(),f=u;var w=n.sqr().add(i.sqr());return a.sqr().add(f.sqr()).cmp(w)>=0&&(a=e,f=r),n.negative&&(n=n.neg(),i=i.neg()),a.negative&&(a=a.neg(),f=f.neg()),[{a:n,b:i},{a:a,b:f}]},c.prototype._endoSplit=function(t){var e=this.endo.basis,r=e[0],n=e[1],i=n.b.mul(t).divRound(this.n),o=r.b.neg().mul(t).divRound(this.n),a=i.mul(r.a),f=o.mul(n.a),s=i.mul(r.b),c=o.mul(n.b);return{k1:t.sub(a).sub(f),k2:s.add(c).neg()}},c.prototype.pointFromX=function(t,e){(t=new o(t,16)).red||(t=t.toRed(this.red));var r=t.redSqr().redMul(t).redIAdd(t.redMul(this.a)).redIAdd(this.b),n=r.redSqrt();if(0!==n.redSqr().redSub(r).cmp(this.zero))throw new Error("invalid point");var i=n.fromRed().isOdd();return(e&&!i||!e&&i)&&(n=n.redNeg()),this.point(t,n)},c.prototype.validate=function(t){if(t.inf)return!0;var e=t.x,r=t.y,n=this.a.redMul(e),i=e.redSqr().redMul(e).redIAdd(n).redIAdd(this.b);return 0===r.redSqr().redISub(i).cmpn(0)},c.prototype._endoWnafMulAdd=function(t,e,r){for(var n=this._endoWnafT1,i=this._endoWnafT2,o=0;o<t.length;o++){var a=this._endoSplit(e[o]),f=t[o],s=f._getBeta();a.k1.negative&&(a.k1.ineg(),f=f.neg(!0)),a.k2.negative&&(a.k2.ineg(),s=s.neg(!0)),n[2*o]=f,n[2*o+1]=s,i[2*o]=a.k1,i[2*o+1]=a.k2}for(var c=this._wnafMulAdd(1,n,i,2*o,r),u=0;u<2*o;u++)n[u]=null,i[u]=null;return c},a(u,f.BasePoint),c.prototype.point=function(t,e,r){return new u(this,t,e,r)},c.prototype.pointFromJSON=function(t,e){return u.fromJSON(this,t,e)},u.prototype._getBeta=function(){if(this.curve.endo){var t=this.precomputed;if(t&&t.beta)return t.beta;var e=this.curve.point(this.x.redMul(this.curve.endo.beta),this.y);if(t){var r=this.curve,n=function(t){return r.point(t.x.redMul(r.endo.beta),t.y)};t.beta=e,e.precomputed={beta:null,naf:t.naf&&{wnd:t.naf.wnd,points:t.naf.points.map(n)},doubles:t.doubles&&{step:t.doubles.step,points:t.doubles.points.map(n)}}}return e}},u.prototype.toJSON=function(){return this.precomputed?[this.x,this.y,this.precomputed&&{doubles:this.precomputed.doubles&&{step:this.precomputed.doubles.step,points:this.precomputed.doubles.points.slice(1)},naf:this.precomputed.naf&&{wnd:this.precomputed.naf.wnd,points:this.precomputed.naf.points.slice(1)}}]:[this.x,this.y]},u.fromJSON=function(t,e,r){"string"==typeof e&&(e=JSON.parse(e));var n=t.point(e[0],e[1],r);if(!e[2])return n;function i(e){return t.point(e[0],e[1],r)}var o=e[2];return n.precomputed={beta:null,doubles:o.doubles&&{step:o.doubles.step,points:[n].concat(o.doubles.points.map(i))},naf:o.naf&&{wnd:o.naf.wnd,points:[n].concat(o.naf.points.map(i))}},n},u.prototype.inspect=function(){return this.isInfinity()?"<EC Point Infinity>":"<EC Point x: "+this.x.fromRed().toString(16,2)+" y: "+this.y.fromRed().toString(16,2)+">"},u.prototype.isInfinity=function(){return this.inf},u.prototype.add=function(t){if(this.inf)return t;if(t.inf)return this;if(this.eq(t))return this.dbl();if(this.neg().eq(t))return this.curve.point(null,null);if(0===this.x.cmp(t.x))return this.curve.point(null,null);var e=this.y.redSub(t.y);0!==e.cmpn(0)&&(e=e.redMul(this.x.redSub(t.x).redInvm()));var r=e.redSqr().redISub(this.x).redISub(t.x),n=e.redMul(this.x.redSub(r)).redISub(this.y);return this.curve.point(r,n)},u.prototype.dbl=function(){if(this.inf)return this;var t=this.y.redAdd(this.y);if(0===t.cmpn(0))return this.curve.point(null,null);var e=this.curve.a,r=this.x.redSqr(),n=t.redInvm(),i=r.redAdd(r).redIAdd(r).redIAdd(e).redMul(n),o=i.redSqr().redISub(this.x.redAdd(this.x)),a=i.redMul(this.x.redSub(o)).redISub(this.y);return this.curve.point(o,a)},u.prototype.getX=function(){return this.x.fromRed()},u.prototype.getY=function(){return this.y.fromRed()},u.prototype.mul=function(t){return t=new o(t,16),this._hasDoubles(t)?this.curve._fixedNafMul(this,t):this.curve.endo?this.curve._endoWnafMulAdd([this],[t]):this.curve._wnafMul(this,t)},u.prototype.mulAdd=function(t,e,r){var n=[this,e],i=[t,r];return this.curve.endo?this.curve._endoWnafMulAdd(n,i):this.curve._wnafMulAdd(1,n,i,2)},u.prototype.jmulAdd=function(t,e,r){var n=[this,e],i=[t,r];return this.curve.endo?this.curve._endoWnafMulAdd(n,i,!0):this.curve._wnafMulAdd(1,n,i,2,!0)},u.prototype.eq=function(t){return this===t||this.inf===t.inf&&(this.inf||0===this.x.cmp(t.x)&&0===this.y.cmp(t.y))},u.prototype.neg=function(t){if(this.inf)return this;var e=this.curve.point(this.x,this.y.redNeg());if(t&&this.precomputed){var r=this.precomputed,n=function(t){return t.neg()};e.precomputed={naf:r.naf&&{wnd:r.naf.wnd,points:r.naf.points.map(n)},doubles:r.doubles&&{step:r.doubles.step,points:r.doubles.points.map(n)}}}return e},u.prototype.toJ=function(){return this.inf?this.curve.jpoint(null,null,null):this.curve.jpoint(this.x,this.y,this.curve.one)},a(h,f.BasePoint),c.prototype.jpoint=function(t,e,r){return new h(this,t,e,r)},h.prototype.toP=function(){if(this.isInfinity())return this.curve.point(null,null);var t=this.z.redInvm(),e=t.redSqr(),r=this.x.redMul(e),n=this.y.redMul(e).redMul(t);return this.curve.point(r,n)},h.prototype.neg=function(){return this.curve.jpoint(this.x,this.y.redNeg(),this.z)},h.prototype.add=function(t){if(this.isInfinity())return t;if(t.isInfinity())return this;var e=t.z.redSqr(),r=this.z.redSqr(),n=this.x.redMul(e),i=t.x.redMul(r),o=this.y.redMul(e.redMul(t.z)),a=t.y.redMul(r.redMul(this.z)),f=n.redSub(i),s=o.redSub(a);if(0===f.cmpn(0))return 0!==s.cmpn(0)?this.curve.jpoint(null,null,null):this.dbl();var c=f.redSqr(),u=c.redMul(f),h=n.redMul(c),d=s.redSqr().redIAdd(u).redISub(h).redISub(h),l=s.redMul(h.redISub(d)).redISub(o.redMul(u)),p=this.z.redMul(t.z).redMul(f);return this.curve.jpoint(d,l,p)},h.prototype.mixedAdd=function(t){if(this.isInfinity())return t.toJ();if(t.isInfinity())return this;var e=this.z.redSqr(),r=this.x,n=t.x.redMul(e),i=this.y,o=t.y.redMul(e).redMul(this.z),a=r.redSub(n),f=i.redSub(o);if(0===a.cmpn(0))return 0!==f.cmpn(0)?this.curve.jpoint(null,null,null):this.dbl();var s=a.redSqr(),c=s.redMul(a),u=r.redMul(s),h=f.redSqr().redIAdd(c).redISub(u).redISub(u),d=f.redMul(u.redISub(h)).redISub(i.redMul(c)),l=this.z.redMul(a);return this.curve.jpoint(h,d,l)},h.prototype.dblp=function(t){if(0===t)return this;if(this.isInfinity())return this;if(!t)return this.dbl();if(this.curve.zeroA||this.curve.threeA){for(var e=this,r=0;r<t;r++)e=e.dbl();return e}var n=this.curve.a,i=this.curve.tinv,o=this.x,a=this.y,f=this.z,s=f.redSqr().redSqr(),c=a.redAdd(a);for(r=0;r<t;r++){var u=o.redSqr(),h=c.redSqr(),d=h.redSqr(),l=u.redAdd(u).redIAdd(u).redIAdd(n.redMul(s)),p=o.redMul(h),b=l.redSqr().redISub(p.redAdd(p)),y=p.redISub(b),v=l.redMul(y);v=v.redIAdd(v).redISub(d);var g=c.redMul(f);r+1<t&&(s=s.redMul(d)),o=b,f=g,c=v}return this.curve.jpoint(o,c.redMul(i),f)},h.prototype.dbl=function(){return this.isInfinity()?this:this.curve.zeroA?this._zeroDbl():this.curve.threeA?this._threeDbl():this._dbl()},h.prototype._zeroDbl=function(){var t,e,r;if(this.zOne){var n=this.x.redSqr(),i=this.y.redSqr(),o=i.redSqr(),a=this.x.redAdd(i).redSqr().redISub(n).redISub(o);a=a.redIAdd(a);var f=n.redAdd(n).redIAdd(n),s=f.redSqr().redISub(a).redISub(a),c=o.redIAdd(o);c=(c=c.redIAdd(c)).redIAdd(c),t=s,e=f.redMul(a.redISub(s)).redISub(c),r=this.y.redAdd(this.y)}else{var u=this.x.redSqr(),h=this.y.redSqr(),d=h.redSqr(),l=this.x.redAdd(h).redSqr().redISub(u).redISub(d);l=l.redIAdd(l);var p=u.redAdd(u).redIAdd(u),b=p.redSqr(),y=d.redIAdd(d);y=(y=y.redIAdd(y)).redIAdd(y),t=b.redISub(l).redISub(l),e=p.redMul(l.redISub(t)).redISub(y),r=(r=this.y.redMul(this.z)).redIAdd(r)}return this.curve.jpoint(t,e,r)},h.prototype._threeDbl=function(){var t,e,r;if(this.zOne){var n=this.x.redSqr(),i=this.y.redSqr(),o=i.redSqr(),a=this.x.redAdd(i).redSqr().redISub(n).redISub(o);a=a.redIAdd(a);var f=n.redAdd(n).redIAdd(n).redIAdd(this.curve.a),s=f.redSqr().redISub(a).redISub(a);t=s;var c=o.redIAdd(o);c=(c=c.redIAdd(c)).redIAdd(c),e=f.redMul(a.redISub(s)).redISub(c),r=this.y.redAdd(this.y)}else{var u=this.z.redSqr(),h=this.y.redSqr(),d=this.x.redMul(h),l=this.x.redSub(u).redMul(this.x.redAdd(u));l=l.redAdd(l).redIAdd(l);var p=d.redIAdd(d),b=(p=p.redIAdd(p)).redAdd(p);t=l.redSqr().redISub(b),r=this.y.redAdd(this.z).redSqr().redISub(h).redISub(u);var y=h.redSqr();y=(y=(y=y.redIAdd(y)).redIAdd(y)).redIAdd(y),e=l.redMul(p.redISub(t)).redISub(y)}return this.curve.jpoint(t,e,r)},h.prototype._dbl=function(){var t=this.curve.a,e=this.x,r=this.y,n=this.z,i=n.redSqr().redSqr(),o=e.redSqr(),a=r.redSqr(),f=o.redAdd(o).redIAdd(o).redIAdd(t.redMul(i)),s=e.redAdd(e),c=(s=s.redIAdd(s)).redMul(a),u=f.redSqr().redISub(c.redAdd(c)),h=c.redISub(u),d=a.redSqr();d=(d=(d=d.redIAdd(d)).redIAdd(d)).redIAdd(d);var l=f.redMul(h).redISub(d),p=r.redAdd(r).redMul(n);return this.curve.jpoint(u,l,p)},h.prototype.trpl=function(){if(!this.curve.zeroA)return this.dbl().add(this);var t=this.x.redSqr(),e=this.y.redSqr(),r=this.z.redSqr(),n=e.redSqr(),i=t.redAdd(t).redIAdd(t),o=i.redSqr(),a=this.x.redAdd(e).redSqr().redISub(t).redISub(n),f=(a=(a=(a=a.redIAdd(a)).redAdd(a).redIAdd(a)).redISub(o)).redSqr(),s=n.redIAdd(n);s=(s=(s=s.redIAdd(s)).redIAdd(s)).redIAdd(s);var c=i.redIAdd(a).redSqr().redISub(o).redISub(f).redISub(s),u=e.redMul(c);u=(u=u.redIAdd(u)).redIAdd(u);var h=this.x.redMul(f).redISub(u);h=(h=h.redIAdd(h)).redIAdd(h);var d=this.y.redMul(c.redMul(s.redISub(c)).redISub(a.redMul(f)));d=(d=(d=d.redIAdd(d)).redIAdd(d)).redIAdd(d);var l=this.z.redAdd(a).redSqr().redISub(r).redISub(f);return this.curve.jpoint(h,d,l)},h.prototype.mul=function(t,e){return t=new o(t,e),this.curve._wnafMul(this,t)},h.prototype.eq=function(t){if("affine"===t.type)return this.eq(t.toJ());if(this===t)return!0;var e=this.z.redSqr(),r=t.z.redSqr();if(0!==this.x.redMul(r).redISub(t.x.redMul(e)).cmpn(0))return!1;var n=e.redMul(this.z),i=r.redMul(t.z);return 0===this.y.redMul(i).redISub(t.y.redMul(n)).cmpn(0)},h.prototype.eqXToP=function(t){var e=this.z.redSqr(),r=t.toRed(this.curve.red).redMul(e);if(0===this.x.cmp(r))return!0;for(var n=t.clone(),i=this.curve.redN.redMul(e);;){if(n.iadd(this.curve.n),n.cmp(this.curve.p)>=0)return!1;if(r.redIAdd(i),0===this.x.cmp(r))return!0}},h.prototype.inspect=function(){return this.isInfinity()?"<EC JPoint Infinity>":"<EC JPoint x: "+this.x.toString(16,2)+" y: "+this.y.toString(16,2)+" z: "+this.z.toString(16,2)+">"},h.prototype.isInfinity=function(){return 0===this.z.cmpn(0)}},function(t,e,r){"use strict";var n=r(22),i=r(2),o=r(0),a=n.base,f=r(4).utils;function s(t){a.call(this,"mont",t),this.a=new i(t.a,16).toRed(this.red),this.b=new i(t.b,16).toRed(this.red),this.i4=new i(4).toRed(this.red).redInvm(),this.two=new i(2).toRed(this.red),this.a24=this.i4.redMul(this.a.redAdd(this.two))}function c(t,e,r){a.BasePoint.call(this,t,"projective"),null===e&&null===r?(this.x=this.curve.one,this.z=this.curve.zero):(this.x=new i(e,16),this.z=new i(r,16),this.x.red||(this.x=this.x.toRed(this.curve.red)),this.z.red||(this.z=this.z.toRed(this.curve.red)))}o(s,a),t.exports=s,s.prototype.validate=function(t){var e=t.normalize().x,r=e.redSqr(),n=r.redMul(e).redAdd(r.redMul(this.a)).redAdd(e);return 0===n.redSqrt().redSqr().cmp(n)},o(c,a.BasePoint),s.prototype.decodePoint=function(t,e){return this.point(f.toArray(t,e),1)},s.prototype.point=function(t,e){return new c(this,t,e)},s.prototype.pointFromJSON=function(t){return c.fromJSON(this,t)},c.prototype.precompute=function(){},c.prototype._encode=function(){return this.getX().toArray("be",this.curve.p.byteLength())},c.fromJSON=function(t,e){return new c(t,e[0],e[1]||t.one)},c.prototype.inspect=function(){return this.isInfinity()?"<EC Point Infinity>":"<EC Point x: "+this.x.fromRed().toString(16,2)+" z: "+this.z.fromRed().toString(16,2)+">"},c.prototype.isInfinity=function(){return 0===this.z.cmpn(0)},c.prototype.dbl=function(){var t=this.x.redAdd(this.z).redSqr(),e=this.x.redSub(this.z).redSqr(),r=t.redSub(e),n=t.redMul(e),i=r.redMul(e.redAdd(this.curve.a24.redMul(r)));return this.curve.point(n,i)},c.prototype.add=function(){throw new Error("Not supported on Montgomery curve")},c.prototype.diffAdd=function(t,e){var r=this.x.redAdd(this.z),n=this.x.redSub(this.z),i=t.x.redAdd(t.z),o=t.x.redSub(t.z).redMul(r),a=i.redMul(n),f=e.z.redMul(o.redAdd(a).redSqr()),s=e.x.redMul(o.redISub(a).redSqr());return this.curve.point(f,s)},c.prototype.mul=function(t){for(var e=t.clone(),r=this,n=this.curve.point(null,null),i=[];0!==e.cmpn(0);e.iushrn(1))i.push(e.andln(1));for(var o=i.length-1;o>=0;o--)0===i[o]?(r=r.diffAdd(n,this),n=n.dbl()):(n=r.diffAdd(n,this),r=r.dbl());return n},c.prototype.mulAdd=function(){throw new Error("Not supported on Montgomery curve")},c.prototype.jumlAdd=function(){throw new Error("Not supported on Montgomery curve")},c.prototype.eq=function(t){return 0===this.getX().cmp(t.getX())},c.prototype.normalize=function(){return this.x=this.x.redMul(this.z.redInvm()),this.z=this.curve.one,this},c.prototype.getX=function(){return this.normalize(),this.x.fromRed()}},function(t,e,r){"use strict";var n=r(22),i=r(4),o=r(2),a=r(0),f=n.base,s=i.utils.assert;function c(t){this.twisted=1!=(0|t.a),this.mOneA=this.twisted&&-1==(0|t.a),this.extended=this.mOneA,f.call(this,"edwards",t),this.a=new o(t.a,16).umod(this.red.m),this.a=this.a.toRed(this.red),this.c=new o(t.c,16).toRed(this.red),this.c2=this.c.redSqr(),this.d=new o(t.d,16).toRed(this.red),this.dd=this.d.redAdd(this.d),s(!this.twisted||0===this.c.fromRed().cmpn(1)),this.oneC=1==(0|t.c)}function u(t,e,r,n,i){f.BasePoint.call(this,t,"projective"),null===e&&null===r&&null===n?(this.x=this.curve.zero,this.y=this.curve.one,this.z=this.curve.one,this.t=this.curve.zero,this.zOne=!0):(this.x=new o(e,16),this.y=new o(r,16),this.z=n?new o(n,16):this.curve.one,this.t=i&&new o(i,16),this.x.red||(this.x=this.x.toRed(this.curve.red)),this.y.red||(this.y=this.y.toRed(this.curve.red)),this.z.red||(this.z=this.z.toRed(this.curve.red)),this.t&&!this.t.red&&(this.t=this.t.toRed(this.curve.red)),this.zOne=this.z===this.curve.one,this.curve.extended&&!this.t&&(this.t=this.x.redMul(this.y),this.zOne||(this.t=this.t.redMul(this.z.redInvm()))))}a(c,f),t.exports=c,c.prototype._mulA=function(t){return this.mOneA?t.redNeg():this.a.redMul(t)},c.prototype._mulC=function(t){return this.oneC?t:this.c.redMul(t)},c.prototype.jpoint=function(t,e,r,n){return this.point(t,e,r,n)},c.prototype.pointFromX=function(t,e){(t=new o(t,16)).red||(t=t.toRed(this.red));var r=t.redSqr(),n=this.c2.redSub(this.a.redMul(r)),i=this.one.redSub(this.c2.redMul(this.d).redMul(r)),a=n.redMul(i.redInvm()),f=a.redSqrt();if(0!==f.redSqr().redSub(a).cmp(this.zero))throw new Error("invalid point");var s=f.fromRed().isOdd();return(e&&!s||!e&&s)&&(f=f.redNeg()),this.point(t,f)},c.prototype.pointFromY=function(t,e){(t=new o(t,16)).red||(t=t.toRed(this.red));var r=t.redSqr(),n=r.redSub(this.c2),i=r.redMul(this.d).redMul(this.c2).redSub(this.a),a=n.redMul(i.redInvm());if(0===a.cmp(this.zero)){if(e)throw new Error("invalid point");return this.point(this.zero,t)}var f=a.redSqrt();if(0!==f.redSqr().redSub(a).cmp(this.zero))throw new Error("invalid point");return f.fromRed().isOdd()!==e&&(f=f.redNeg()),this.point(f,t)},c.prototype.validate=function(t){if(t.isInfinity())return!0;t.normalize();var e=t.x.redSqr(),r=t.y.redSqr(),n=e.redMul(this.a).redAdd(r),i=this.c2.redMul(this.one.redAdd(this.d.redMul(e).redMul(r)));return 0===n.cmp(i)},a(u,f.BasePoint),c.prototype.pointFromJSON=function(t){return u.fromJSON(this,t)},c.prototype.point=function(t,e,r,n){return new u(this,t,e,r,n)},u.fromJSON=function(t,e){return new u(t,e[0],e[1],e[2])},u.prototype.inspect=function(){return this.isInfinity()?"<EC Point Infinity>":"<EC Point x: "+this.x.fromRed().toString(16,2)+" y: "+this.y.fromRed().toString(16,2)+" z: "+this.z.fromRed().toString(16,2)+">"},u.prototype.isInfinity=function(){return 0===this.x.cmpn(0)&&(0===this.y.cmp(this.z)||this.zOne&&0===this.y.cmp(this.curve.c))},u.prototype._extDbl=function(){var t=this.x.redSqr(),e=this.y.redSqr(),r=this.z.redSqr();r=r.redIAdd(r);var n=this.curve._mulA(t),i=this.x.redAdd(this.y).redSqr().redISub(t).redISub(e),o=n.redAdd(e),a=o.redSub(r),f=n.redSub(e),s=i.redMul(a),c=o.redMul(f),u=i.redMul(f),h=a.redMul(o);return this.curve.point(s,c,h,u)},u.prototype._projDbl=function(){var t,e,r,n=this.x.redAdd(this.y).redSqr(),i=this.x.redSqr(),o=this.y.redSqr();if(this.curve.twisted){var a=(c=this.curve._mulA(i)).redAdd(o);if(this.zOne)t=n.redSub(i).redSub(o).redMul(a.redSub(this.curve.two)),e=a.redMul(c.redSub(o)),r=a.redSqr().redSub(a).redSub(a);else{var f=this.z.redSqr(),s=a.redSub(f).redISub(f);t=n.redSub(i).redISub(o).redMul(s),e=a.redMul(c.redSub(o)),r=a.redMul(s)}}else{var c=i.redAdd(o);f=this.curve._mulC(this.z).redSqr(),s=c.redSub(f).redSub(f),t=this.curve._mulC(n.redISub(c)).redMul(s),e=this.curve._mulC(c).redMul(i.redISub(o)),r=c.redMul(s)}return this.curve.point(t,e,r)},u.prototype.dbl=function(){return this.isInfinity()?this:this.curve.extended?this._extDbl():this._projDbl()},u.prototype._extAdd=function(t){var e=this.y.redSub(this.x).redMul(t.y.redSub(t.x)),r=this.y.redAdd(this.x).redMul(t.y.redAdd(t.x)),n=this.t.redMul(this.curve.dd).redMul(t.t),i=this.z.redMul(t.z.redAdd(t.z)),o=r.redSub(e),a=i.redSub(n),f=i.redAdd(n),s=r.redAdd(e),c=o.redMul(a),u=f.redMul(s),h=o.redMul(s),d=a.redMul(f);return this.curve.point(c,u,d,h)},u.prototype._projAdd=function(t){var e,r,n=this.z.redMul(t.z),i=n.redSqr(),o=this.x.redMul(t.x),a=this.y.redMul(t.y),f=this.curve.d.redMul(o).redMul(a),s=i.redSub(f),c=i.redAdd(f),u=this.x.redAdd(this.y).redMul(t.x.redAdd(t.y)).redISub(o).redISub(a),h=n.redMul(s).redMul(u);return this.curve.twisted?(e=n.redMul(c).redMul(a.redSub(this.curve._mulA(o))),r=s.redMul(c)):(e=n.redMul(c).redMul(a.redSub(o)),r=this.curve._mulC(s).redMul(c)),this.curve.point(h,e,r)},u.prototype.add=function(t){return this.isInfinity()?t:t.isInfinity()?this:this.curve.extended?this._extAdd(t):this._projAdd(t)},u.prototype.mul=function(t){return this._hasDoubles(t)?this.curve._fixedNafMul(this,t):this.curve._wnafMul(this,t)},u.prototype.mulAdd=function(t,e,r){return this.curve._wnafMulAdd(1,[this,e],[t,r],2,!1)},u.prototype.jmulAdd=function(t,e,r){return this.curve._wnafMulAdd(1,[this,e],[t,r],2,!0)},u.prototype.normalize=function(){if(this.zOne)return this;var t=this.z.redInvm();return this.x=this.x.redMul(t),this.y=this.y.redMul(t),this.t&&(this.t=this.t.redMul(t)),this.z=this.curve.one,this.zOne=!0,this},u.prototype.neg=function(){return this.curve.point(this.x.redNeg(),this.y,this.z,this.t&&this.t.redNeg())},u.prototype.getX=function(){return this.normalize(),this.x.fromRed()},u.prototype.getY=function(){return this.normalize(),this.y.fromRed()},u.prototype.eq=function(t){return this===t||0===this.getX().cmp(t.getX())&&0===this.getY().cmp(t.getY())},u.prototype.eqXToP=function(t){var e=t.toRed(this.curve.red).redMul(this.z);if(0===this.x.cmp(e))return!0;for(var r=t.clone(),n=this.curve.redN.redMul(this.z);;){if(r.iadd(this.curve.n),r.cmp(this.curve.p)>=0)return!1;if(e.redIAdd(n),0===this.x.cmp(e))return!0}},u.prototype.toP=u.prototype.normalize,u.prototype.mixedAdd=u.prototype.add},function(t,e,r){"use strict";var n,i=e,o=r(36),a=r(4),f=a.utils.assert;function s(t){"short"===t.type?this.curve=new a.curve.short(t):"edwards"===t.type?this.curve=new a.curve.edwards(t):this.curve=new a.curve.mont(t),this.g=this.curve.g,this.n=this.curve.n,this.hash=t.hash,f(this.g.validate(),"Invalid curve"),f(this.g.mul(this.n).isInfinity(),"Invalid curve, G*N != O")}function c(t,e){Object.defineProperty(i,t,{configurable:!0,enumerable:!0,get:function(){var r=new s(e);return Object.defineProperty(i,t,{configurable:!0,enumerable:!0,value:r}),r}})}i.PresetCurve=s,c("p192",{type:"short",prime:"p192",p:"ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff",a:"ffffffff ffffffff ffffffff fffffffe ffffffff fffffffc",b:"64210519 e59c80e7 0fa7e9ab 72243049 feb8deec c146b9b1",n:"ffffffff ffffffff ffffffff 99def836 146bc9b1 b4d22831",hash:o.sha256,gRed:!1,g:["188da80e b03090f6 7cbf20eb 43a18800 f4ff0afd 82ff1012","07192b95 ffc8da78 631011ed 6b24cdd5 73f977a1 1e794811"]}),c("p224",{type:"short",prime:"p224",p:"ffffffff ffffffff ffffffff ffffffff 00000000 00000000 00000001",a:"ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff fffffffe",b:"b4050a85 0c04b3ab f5413256 5044b0b7 d7bfd8ba 270b3943 2355ffb4",n:"ffffffff ffffffff ffffffff ffff16a2 e0b8f03e 13dd2945 5c5c2a3d",hash:o.sha256,gRed:!1,g:["b70e0cbd 6bb4bf7f 321390b9 4a03c1d3 56c21122 343280d6 115c1d21","bd376388 b5f723fb 4c22dfe6 cd4375a0 5a074764 44d58199 85007e34"]}),c("p256",{type:"short",prime:null,p:"ffffffff 00000001 00000000 00000000 00000000 ffffffff ffffffff ffffffff",a:"ffffffff 00000001 00000000 00000000 00000000 ffffffff ffffffff fffffffc",b:"5ac635d8 aa3a93e7 b3ebbd55 769886bc 651d06b0 cc53b0f6 3bce3c3e 27d2604b",n:"ffffffff 00000000 ffffffff ffffffff bce6faad a7179e84 f3b9cac2 fc632551",hash:o.sha256,gRed:!1,g:["6b17d1f2 e12c4247 f8bce6e5 63a440f2 77037d81 2deb33a0 f4a13945 d898c296","4fe342e2 fe1a7f9b 8ee7eb4a 7c0f9e16 2bce3357 6b315ece cbb64068 37bf51f5"]}),c("p384",{type:"short",prime:null,p:"ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe ffffffff 00000000 00000000 ffffffff",a:"ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe ffffffff 00000000 00000000 fffffffc",b:"b3312fa7 e23ee7e4 988e056b e3f82d19 181d9c6e fe814112 0314088f 5013875a c656398d 8a2ed19d 2a85c8ed d3ec2aef",n:"ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff c7634d81 f4372ddf 581a0db2 48b0a77a ecec196a ccc52973",hash:o.sha384,gRed:!1,g:["aa87ca22 be8b0537 8eb1c71e f320ad74 6e1d3b62 8ba79b98 59f741e0 82542a38 5502f25d bf55296c 3a545e38 72760ab7","3617de4a 96262c6f 5d9e98bf 9292dc29 f8f41dbd 289a147c e9da3113 b5f0b8c0 0a60b1ce 1d7e819d 7a431d7c 90ea0e5f"]}),c("p521",{type:"short",prime:null,p:"000001ff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff",a:"000001ff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffc",b:"00000051 953eb961 8e1c9a1f 929a21a0 b68540ee a2da725b 99b315f3 b8b48991 8ef109e1 56193951 ec7e937b 1652c0bd 3bb1bf07 3573df88 3d2c34f1 ef451fd4 6b503f00",n:"000001ff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffa 51868783 bf2f966b 7fcc0148 f709a5d0 3bb5c9b8 899c47ae bb6fb71e 91386409",hash:o.sha512,gRed:!1,g:["000000c6 858e06b7 0404e9cd 9e3ecb66 2395b442 9c648139 053fb521 f828af60 6b4d3dba a14b5e77 efe75928 fe1dc127 a2ffa8de 3348b3c1 856a429b f97e7e31 c2e5bd66","00000118 39296a78 9a3bc004 5c8a5fb4 2c7d1bd9 98f54449 579b4468 17afbd17 273e662c 97ee7299 5ef42640 c550b901 3fad0761 353c7086 a272c240 88be9476 9fd16650"]}),c("curve25519",{type:"mont",prime:"p25519",p:"7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed",a:"76d06",b:"1",n:"1000000000000000 0000000000000000 14def9dea2f79cd6 5812631a5cf5d3ed",hash:o.sha256,gRed:!1,g:["9"]}),c("ed25519",{type:"edwards",prime:"p25519",p:"7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed",a:"-1",c:"1",d:"52036cee2b6ffe73 8cc740797779e898 00700a4d4141d8ab 75eb4dca135978a3",n:"1000000000000000 0000000000000000 14def9dea2f79cd6 5812631a5cf5d3ed",hash:o.sha256,gRed:!1,g:["216936d3cd6e53fec0a4e231fdd6dc5c692cc7609525a7b2c9562d608f25d51a","6666666666666666666666666666666666666666666666666666666666666658"]});try{n=r(134)}catch(t){n=void 0}c("secp256k1",{type:"short",prime:"k256",p:"ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2f",a:"0",b:"7",n:"ffffffff ffffffff ffffffff fffffffe baaedce6 af48a03b bfd25e8c d0364141",h:"1",hash:o.sha256,beta:"7ae96a2b657c07106e64479eac3434e99cf0497512f58995c1396c28719501ee",lambda:"5363ad4cc05c30e0a5261c028812645a122e22ea20816678df02967c1b23bd72",basis:[{a:"3086d221a7d46bcde86c90e49284eb15",b:"-e4437ed6010e88286f547fa90abfe4c3"},{a:"114ca50f7a8e2f3f657c1108d9d44cfd8",b:"3086d221a7d46bcde86c90e49284eb15"}],gRed:!1,g:["79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798","483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8",n]})},function(t,e,r){"use strict";e.sha1=r(129),e.sha224=r(130),e.sha256=r(62),e.sha384=r(131),e.sha512=r(63)},function(t,e,r){"use strict";var n=r(6),i=r(16),o=r(61),a=n.rotl32,f=n.sum32,s=n.sum32_5,c=o.ft_1,u=i.BlockHash,h=[1518500249,1859775393,2400959708,3395469782];function d(){if(!(this instanceof d))return new d;u.call(this),this.h=[1732584193,4023233417,2562383102,271733878,3285377520],this.W=new Array(80)}n.inherits(d,u),t.exports=d,d.blockSize=512,d.outSize=160,d.hmacStrength=80,d.padLength=64,d.prototype._update=function(t,e){for(var r=this.W,n=0;n<16;n++)r[n]=t[e+n];for(;n<r.length;n++)r[n]=a(r[n-3]^r[n-8]^r[n-14]^r[n-16],1);var i=this.h[0],o=this.h[1],u=this.h[2],d=this.h[3],l=this.h[4];for(n=0;n<r.length;n++){var p=~~(n/20),b=s(a(i,5),c(p,o,u,d),l,r[n],h[p]);l=d,d=u,u=a(o,30),o=i,i=b}this.h[0]=f(this.h[0],i),this.h[1]=f(this.h[1],o),this.h[2]=f(this.h[2],u),this.h[3]=f(this.h[3],d),this.h[4]=f(this.h[4],l)},d.prototype._digest=function(t){return"hex"===t?n.toHex32(this.h,"big"):n.split32(this.h,"big")}},function(t,e,r){"use strict";var n=r(6),i=r(62);function o(){if(!(this instanceof o))return new o;i.call(this),this.h=[3238371032,914150663,812702999,4144912697,4290775857,1750603025,1694076839,3204075428]}n.inherits(o,i),t.exports=o,o.blockSize=512,o.outSize=224,o.hmacStrength=192,o.padLength=64,o.prototype._digest=function(t){return"hex"===t?n.toHex32(this.h.slice(0,7),"big"):n.split32(this.h.slice(0,7),"big")}},function(t,e,r){"use strict";var n=r(6),i=r(63);function o(){if(!(this instanceof o))return new o;i.call(this),this.h=[3418070365,3238371032,1654270250,914150663,2438529370,812702999,355462360,4144912697,1731405415,4290775857,2394180231,1750603025,3675008525,1694076839,1203062813,3204075428]}n.inherits(o,i),t.exports=o,o.blockSize=1024,o.outSize=384,o.hmacStrength=192,o.padLength=128,o.prototype._digest=function(t){return"hex"===t?n.toHex32(this.h.slice(0,12),"big"):n.split32(this.h.slice(0,12),"big")}},function(t,e,r){"use strict";var n=r(6),i=r(16),o=n.rotl32,a=n.sum32,f=n.sum32_3,s=n.sum32_4,c=i.BlockHash;function u(){if(!(this instanceof u))return new u;c.call(this),this.h=[1732584193,4023233417,2562383102,271733878,3285377520],this.endian="little"}function h(t,e,r,n){return t<=15?e^r^n:t<=31?e&r|~e&n:t<=47?(e|~r)^n:t<=63?e&n|r&~n:e^(r|~n)}function d(t){return t<=15?0:t<=31?1518500249:t<=47?1859775393:t<=63?2400959708:2840853838}function l(t){return t<=15?1352829926:t<=31?1548603684:t<=47?1836072691:t<=63?2053994217:0}n.inherits(u,c),e.ripemd160=u,u.blockSize=512,u.outSize=160,u.hmacStrength=192,u.padLength=64,u.prototype._update=function(t,e){for(var r=this.h[0],n=this.h[1],i=this.h[2],c=this.h[3],u=this.h[4],g=r,m=n,_=i,w=c,S=u,E=0;E<80;E++){var M=a(o(s(r,h(E,n,i,c),t[p[E]+e],d(E)),y[E]),u);r=u,u=c,c=o(i,10),i=n,n=M,M=a(o(s(g,h(79-E,m,_,w),t[b[E]+e],l(E)),v[E]),S),g=S,S=w,w=o(_,10),_=m,m=M}M=f(this.h[1],i,w),this.h[1]=f(this.h[2],c,S),this.h[2]=f(this.h[3],u,g),this.h[3]=f(this.h[4],r,m),this.h[4]=f(this.h[0],n,_),this.h[0]=M},u.prototype._digest=function(t){return"hex"===t?n.toHex32(this.h,"little"):n.split32(this.h,"little")};var p=[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,7,4,13,1,10,6,15,3,12,0,9,5,2,14,11,8,3,10,14,4,9,15,8,1,2,7,0,6,13,11,5,12,1,9,11,10,0,8,12,4,13,3,7,15,14,5,6,2,4,0,5,9,7,12,2,10,14,1,3,8,11,6,15,13],b=[5,14,7,0,9,2,11,4,13,6,15,8,1,10,3,12,6,11,3,7,0,13,5,10,14,15,8,12,4,9,1,2,15,5,1,3,7,14,6,9,11,8,12,2,10,0,4,13,8,6,4,1,3,11,15,0,5,12,2,13,9,7,10,14,12,15,10,4,1,5,8,7,6,2,13,14,0,3,9,11],y=[11,14,15,12,5,8,7,9,11,13,14,15,6,7,9,8,7,6,8,13,11,9,7,15,7,12,15,9,11,7,13,12,11,13,6,7,14,9,13,15,14,8,13,6,5,12,7,5,11,12,14,15,14,15,9,8,9,14,5,6,8,6,5,12,9,15,5,11,6,8,13,12,5,12,13,14,11,8,5,6],v=[8,9,9,11,13,15,15,5,7,7,8,11,14,14,12,6,9,13,15,7,12,8,9,11,7,7,12,7,6,15,13,11,9,7,15,11,8,6,6,14,12,13,5,14,13,13,7,5,15,5,8,11,14,14,6,14,6,9,12,9,12,5,15,8,8,5,12,9,12,5,14,6,8,13,6,5,15,13,11,11]},function(t,e,r){"use strict";var n=r(6),i=r(5);function o(t,e,r){if(!(this instanceof o))return new o(t,e,r);this.Hash=t,this.blockSize=t.blockSize/8,this.outSize=t.outSize/8,this.inner=null,this.outer=null,this._init(n.toArray(e,r))}t.exports=o,o.prototype._init=function(t){t.length>this.blockSize&&(t=(new this.Hash).update(t).digest()),i(t.length<=this.blockSize);for(var e=t.length;e<this.blockSize;e++)t.push(0);for(e=0;e<t.length;e++)t[e]^=54;for(this.inner=(new this.Hash).update(t),e=0;e<t.length;e++)t[e]^=106;this.outer=(new this.Hash).update(t)},o.prototype.update=function(t,e){return this.inner.update(t,e),this},o.prototype.digest=function(t){return this.outer.update(this.inner.digest()),this.outer.digest(t)}},function(t,e){t.exports={doubles:{step:4,points:[["e60fce93b59e9ec53011aabc21c23e97b2a31369b87a5ae9c44ee89e2a6dec0a","f7e3507399e595929db99f34f57937101296891e44d23f0be1f32cce69616821"],["8282263212c609d9ea2a6e3e172de238d8c39cabd5ac1ca10646e23fd5f51508","11f8a8098557dfe45e8256e830b60ace62d613ac2f7b17bed31b6eaff6e26caf"],["175e159f728b865a72f99cc6c6fc846de0b93833fd2222ed73fce5b551e5b739","d3506e0d9e3c79eba4ef97a51ff71f5eacb5955add24345c6efa6ffee9fed695"],["363d90d447b00c9c99ceac05b6262ee053441c7e55552ffe526bad8f83ff4640","4e273adfc732221953b445397f3363145b9a89008199ecb62003c7f3bee9de9"],["8b4b5f165df3c2be8c6244b5b745638843e4a781a15bcd1b69f79a55dffdf80c","4aad0a6f68d308b4b3fbd7813ab0da04f9e336546162ee56b3eff0c65fd4fd36"],["723cbaa6e5db996d6bf771c00bd548c7b700dbffa6c0e77bcb6115925232fcda","96e867b5595cc498a921137488824d6e2660a0653779494801dc069d9eb39f5f"],["eebfa4d493bebf98ba5feec812c2d3b50947961237a919839a533eca0e7dd7fa","5d9a8ca3970ef0f269ee7edaf178089d9ae4cdc3a711f712ddfd4fdae1de8999"],["100f44da696e71672791d0a09b7bde459f1215a29b3c03bfefd7835b39a48db0","cdd9e13192a00b772ec8f3300c090666b7ff4a18ff5195ac0fbd5cd62bc65a09"],["e1031be262c7ed1b1dc9227a4a04c017a77f8d4464f3b3852c8acde6e534fd2d","9d7061928940405e6bb6a4176597535af292dd419e1ced79a44f18f29456a00d"],["feea6cae46d55b530ac2839f143bd7ec5cf8b266a41d6af52d5e688d9094696d","e57c6b6c97dce1bab06e4e12bf3ecd5c981c8957cc41442d3155debf18090088"],["da67a91d91049cdcb367be4be6ffca3cfeed657d808583de33fa978bc1ec6cb1","9bacaa35481642bc41f463f7ec9780e5dec7adc508f740a17e9ea8e27a68be1d"],["53904faa0b334cdda6e000935ef22151ec08d0f7bb11069f57545ccc1a37b7c0","5bc087d0bc80106d88c9eccac20d3c1c13999981e14434699dcb096b022771c8"],["8e7bcd0bd35983a7719cca7764ca906779b53a043a9b8bcaeff959f43ad86047","10b7770b2a3da4b3940310420ca9514579e88e2e47fd68b3ea10047e8460372a"],["385eed34c1cdff21e6d0818689b81bde71a7f4f18397e6690a841e1599c43862","283bebc3e8ea23f56701de19e9ebf4576b304eec2086dc8cc0458fe5542e5453"],["6f9d9b803ecf191637c73a4413dfa180fddf84a5947fbc9c606ed86c3fac3a7","7c80c68e603059ba69b8e2a30e45c4d47ea4dd2f5c281002d86890603a842160"],["3322d401243c4e2582a2147c104d6ecbf774d163db0f5e5313b7e0e742d0e6bd","56e70797e9664ef5bfb019bc4ddaf9b72805f63ea2873af624f3a2e96c28b2a0"],["85672c7d2de0b7da2bd1770d89665868741b3f9af7643397721d74d28134ab83","7c481b9b5b43b2eb6374049bfa62c2e5e77f17fcc5298f44c8e3094f790313a6"],["948bf809b1988a46b06c9f1919413b10f9226c60f668832ffd959af60c82a0a","53a562856dcb6646dc6b74c5d1c3418c6d4dff08c97cd2bed4cb7f88d8c8e589"],["6260ce7f461801c34f067ce0f02873a8f1b0e44dfc69752accecd819f38fd8e8","bc2da82b6fa5b571a7f09049776a1ef7ecd292238051c198c1a84e95b2b4ae17"],["e5037de0afc1d8d43d8348414bbf4103043ec8f575bfdc432953cc8d2037fa2d","4571534baa94d3b5f9f98d09fb990bddbd5f5b03ec481f10e0e5dc841d755bda"],["e06372b0f4a207adf5ea905e8f1771b4e7e8dbd1c6a6c5b725866a0ae4fce725","7a908974bce18cfe12a27bb2ad5a488cd7484a7787104870b27034f94eee31dd"],["213c7a715cd5d45358d0bbf9dc0ce02204b10bdde2a3f58540ad6908d0559754","4b6dad0b5ae462507013ad06245ba190bb4850f5f36a7eeddff2c27534b458f2"],["4e7c272a7af4b34e8dbb9352a5419a87e2838c70adc62cddf0cc3a3b08fbd53c","17749c766c9d0b18e16fd09f6def681b530b9614bff7dd33e0b3941817dcaae6"],["fea74e3dbe778b1b10f238ad61686aa5c76e3db2be43057632427e2840fb27b6","6e0568db9b0b13297cf674deccb6af93126b596b973f7b77701d3db7f23cb96f"],["76e64113f677cf0e10a2570d599968d31544e179b760432952c02a4417bdde39","c90ddf8dee4e95cf577066d70681f0d35e2a33d2b56d2032b4b1752d1901ac01"],["c738c56b03b2abe1e8281baa743f8f9a8f7cc643df26cbee3ab150242bcbb891","893fb578951ad2537f718f2eacbfbbbb82314eef7880cfe917e735d9699a84c3"],["d895626548b65b81e264c7637c972877d1d72e5f3a925014372e9f6588f6c14b","febfaa38f2bc7eae728ec60818c340eb03428d632bb067e179363ed75d7d991f"],["b8da94032a957518eb0f6433571e8761ceffc73693e84edd49150a564f676e03","2804dfa44805a1e4d7c99cc9762808b092cc584d95ff3b511488e4e74efdf6e7"],["e80fea14441fb33a7d8adab9475d7fab2019effb5156a792f1a11778e3c0df5d","eed1de7f638e00771e89768ca3ca94472d155e80af322ea9fcb4291b6ac9ec78"],["a301697bdfcd704313ba48e51d567543f2a182031efd6915ddc07bbcc4e16070","7370f91cfb67e4f5081809fa25d40f9b1735dbf7c0a11a130c0d1a041e177ea1"],["90ad85b389d6b936463f9d0512678de208cc330b11307fffab7ac63e3fb04ed4","e507a3620a38261affdcbd9427222b839aefabe1582894d991d4d48cb6ef150"],["8f68b9d2f63b5f339239c1ad981f162ee88c5678723ea3351b7b444c9ec4c0da","662a9f2dba063986de1d90c2b6be215dbbea2cfe95510bfdf23cbf79501fff82"],["e4f3fb0176af85d65ff99ff9198c36091f48e86503681e3e6686fd5053231e11","1e63633ad0ef4f1c1661a6d0ea02b7286cc7e74ec951d1c9822c38576feb73bc"],["8c00fa9b18ebf331eb961537a45a4266c7034f2f0d4e1d0716fb6eae20eae29e","efa47267fea521a1a9dc343a3736c974c2fadafa81e36c54e7d2a4c66702414b"],["e7a26ce69dd4829f3e10cec0a9e98ed3143d084f308b92c0997fddfc60cb3e41","2a758e300fa7984b471b006a1aafbb18d0a6b2c0420e83e20e8a9421cf2cfd51"],["b6459e0ee3662ec8d23540c223bcbdc571cbcb967d79424f3cf29eb3de6b80ef","67c876d06f3e06de1dadf16e5661db3c4b3ae6d48e35b2ff30bf0b61a71ba45"],["d68a80c8280bb840793234aa118f06231d6f1fc67e73c5a5deda0f5b496943e8","db8ba9fff4b586d00c4b1f9177b0e28b5b0e7b8f7845295a294c84266b133120"],["324aed7df65c804252dc0270907a30b09612aeb973449cea4095980fc28d3d5d","648a365774b61f2ff130c0c35aec1f4f19213b0c7e332843967224af96ab7c84"],["4df9c14919cde61f6d51dfdbe5fee5dceec4143ba8d1ca888e8bd373fd054c96","35ec51092d8728050974c23a1d85d4b5d506cdc288490192ebac06cad10d5d"],["9c3919a84a474870faed8a9c1cc66021523489054d7f0308cbfc99c8ac1f98cd","ddb84f0f4a4ddd57584f044bf260e641905326f76c64c8e6be7e5e03d4fc599d"],["6057170b1dd12fdf8de05f281d8e06bb91e1493a8b91d4cc5a21382120a959e5","9a1af0b26a6a4807add9a2daf71df262465152bc3ee24c65e899be932385a2a8"],["a576df8e23a08411421439a4518da31880cef0fba7d4df12b1a6973eecb94266","40a6bf20e76640b2c92b97afe58cd82c432e10a7f514d9f3ee8be11ae1b28ec8"],["7778a78c28dec3e30a05fe9629de8c38bb30d1f5cf9a3a208f763889be58ad71","34626d9ab5a5b22ff7098e12f2ff580087b38411ff24ac563b513fc1fd9f43ac"],["928955ee637a84463729fd30e7afd2ed5f96274e5ad7e5cb09eda9c06d903ac","c25621003d3f42a827b78a13093a95eeac3d26efa8a8d83fc5180e935bcd091f"],["85d0fef3ec6db109399064f3a0e3b2855645b4a907ad354527aae75163d82751","1f03648413a38c0be29d496e582cf5663e8751e96877331582c237a24eb1f962"],["ff2b0dce97eece97c1c9b6041798b85dfdfb6d8882da20308f5404824526087e","493d13fef524ba188af4c4dc54d07936c7b7ed6fb90e2ceb2c951e01f0c29907"],["827fbbe4b1e880ea9ed2b2e6301b212b57f1ee148cd6dd28780e5e2cf856e241","c60f9c923c727b0b71bef2c67d1d12687ff7a63186903166d605b68baec293ec"],["eaa649f21f51bdbae7be4ae34ce6e5217a58fdce7f47f9aa7f3b58fa2120e2b3","be3279ed5bbbb03ac69a80f89879aa5a01a6b965f13f7e59d47a5305ba5ad93d"],["e4a42d43c5cf169d9391df6decf42ee541b6d8f0c9a137401e23632dda34d24f","4d9f92e716d1c73526fc99ccfb8ad34ce886eedfa8d8e4f13a7f7131deba9414"],["1ec80fef360cbdd954160fadab352b6b92b53576a88fea4947173b9d4300bf19","aeefe93756b5340d2f3a4958a7abbf5e0146e77f6295a07b671cdc1cc107cefd"],["146a778c04670c2f91b00af4680dfa8bce3490717d58ba889ddb5928366642be","b318e0ec3354028add669827f9d4b2870aaa971d2f7e5ed1d0b297483d83efd0"],["fa50c0f61d22e5f07e3acebb1aa07b128d0012209a28b9776d76a8793180eef9","6b84c6922397eba9b72cd2872281a68a5e683293a57a213b38cd8d7d3f4f2811"],["da1d61d0ca721a11b1a5bf6b7d88e8421a288ab5d5bba5220e53d32b5f067ec2","8157f55a7c99306c79c0766161c91e2966a73899d279b48a655fba0f1ad836f1"],["a8e282ff0c9706907215ff98e8fd416615311de0446f1e062a73b0610d064e13","7f97355b8db81c09abfb7f3c5b2515888b679a3e50dd6bd6cef7c73111f4cc0c"],["174a53b9c9a285872d39e56e6913cab15d59b1fa512508c022f382de8319497c","ccc9dc37abfc9c1657b4155f2c47f9e6646b3a1d8cb9854383da13ac079afa73"],["959396981943785c3d3e57edf5018cdbe039e730e4918b3d884fdff09475b7ba","2e7e552888c331dd8ba0386a4b9cd6849c653f64c8709385e9b8abf87524f2fd"],["d2a63a50ae401e56d645a1153b109a8fcca0a43d561fba2dbb51340c9d82b151","e82d86fb6443fcb7565aee58b2948220a70f750af484ca52d4142174dcf89405"],["64587e2335471eb890ee7896d7cfdc866bacbdbd3839317b3436f9b45617e073","d99fcdd5bf6902e2ae96dd6447c299a185b90a39133aeab358299e5e9faf6589"],["8481bde0e4e4d885b3a546d3e549de042f0aa6cea250e7fd358d6c86dd45e458","38ee7b8cba5404dd84a25bf39cecb2ca900a79c42b262e556d64b1b59779057e"],["13464a57a78102aa62b6979ae817f4637ffcfed3c4b1ce30bcd6303f6caf666b","69be159004614580ef7e433453ccb0ca48f300a81d0942e13f495a907f6ecc27"],["bc4a9df5b713fe2e9aef430bcc1dc97a0cd9ccede2f28588cada3a0d2d83f366","d3a81ca6e785c06383937adf4b798caa6e8a9fbfa547b16d758d666581f33c1"],["8c28a97bf8298bc0d23d8c749452a32e694b65e30a9472a3954ab30fe5324caa","40a30463a3305193378fedf31f7cc0eb7ae784f0451cb9459e71dc73cbef9482"],["8ea9666139527a8c1dd94ce4f071fd23c8b350c5a4bb33748c4ba111faccae0","620efabbc8ee2782e24e7c0cfb95c5d735b783be9cf0f8e955af34a30e62b945"],["dd3625faef5ba06074669716bbd3788d89bdde815959968092f76cc4eb9a9787","7a188fa3520e30d461da2501045731ca941461982883395937f68d00c644a573"],["f710d79d9eb962297e4f6232b40e8f7feb2bc63814614d692c12de752408221e","ea98e67232d3b3295d3b535532115ccac8612c721851617526ae47a9c77bfc82"]]},naf:{wnd:7,points:[["f9308a019258c31049344f85f89d5229b531c845836f99b08601f113bce036f9","388f7b0f632de8140fe337e62a37f3566500a99934c2231b6cb9fd7584b8e672"],["2f8bde4d1a07209355b4a7250a5c5128e88b84bddc619ab7cba8d569b240efe4","d8ac222636e5e3d6d4dba9dda6c9c426f788271bab0d6840dca87d3aa6ac62d6"],["5cbdf0646e5db4eaa398f365f2ea7a0e3d419b7e0330e39ce92bddedcac4f9bc","6aebca40ba255960a3178d6d861a54dba813d0b813fde7b5a5082628087264da"],["acd484e2f0c7f65309ad178a9f559abde09796974c57e714c35f110dfc27ccbe","cc338921b0a7d9fd64380971763b61e9add888a4375f8e0f05cc262ac64f9c37"],["774ae7f858a9411e5ef4246b70c65aac5649980be5c17891bbec17895da008cb","d984a032eb6b5e190243dd56d7b7b365372db1e2dff9d6a8301d74c9c953c61b"],["f28773c2d975288bc7d1d205c3748651b075fbc6610e58cddeeddf8f19405aa8","ab0902e8d880a89758212eb65cdaf473a1a06da521fa91f29b5cb52db03ed81"],["d7924d4f7d43ea965a465ae3095ff41131e5946f3c85f79e44adbcf8e27e080e","581e2872a86c72a683842ec228cc6defea40af2bd896d3a5c504dc9ff6a26b58"],["defdea4cdb677750a420fee807eacf21eb9898ae79b9768766e4faa04a2d4a34","4211ab0694635168e997b0ead2a93daeced1f4a04a95c0f6cfb199f69e56eb77"],["2b4ea0a797a443d293ef5cff444f4979f06acfebd7e86d277475656138385b6c","85e89bc037945d93b343083b5a1c86131a01f60c50269763b570c854e5c09b7a"],["352bbf4a4cdd12564f93fa332ce333301d9ad40271f8107181340aef25be59d5","321eb4075348f534d59c18259dda3e1f4a1b3b2e71b1039c67bd3d8bcf81998c"],["2fa2104d6b38d11b0230010559879124e42ab8dfeff5ff29dc9cdadd4ecacc3f","2de1068295dd865b64569335bd5dd80181d70ecfc882648423ba76b532b7d67"],["9248279b09b4d68dab21a9b066edda83263c3d84e09572e269ca0cd7f5453714","73016f7bf234aade5d1aa71bdea2b1ff3fc0de2a887912ffe54a32ce97cb3402"],["daed4f2be3a8bf278e70132fb0beb7522f570e144bf615c07e996d443dee8729","a69dce4a7d6c98e8d4a1aca87ef8d7003f83c230f3afa726ab40e52290be1c55"],["c44d12c7065d812e8acf28d7cbb19f9011ecd9e9fdf281b0e6a3b5e87d22e7db","2119a460ce326cdc76c45926c982fdac0e106e861edf61c5a039063f0e0e6482"],["6a245bf6dc698504c89a20cfded60853152b695336c28063b61c65cbd269e6b4","e022cf42c2bd4a708b3f5126f16a24ad8b33ba48d0423b6efd5e6348100d8a82"],["1697ffa6fd9de627c077e3d2fe541084ce13300b0bec1146f95ae57f0d0bd6a5","b9c398f186806f5d27561506e4557433a2cf15009e498ae7adee9d63d01b2396"],["605bdb019981718b986d0f07e834cb0d9deb8360ffb7f61df982345ef27a7479","2972d2de4f8d20681a78d93ec96fe23c26bfae84fb14db43b01e1e9056b8c49"],["62d14dab4150bf497402fdc45a215e10dcb01c354959b10cfe31c7e9d87ff33d","80fc06bd8cc5b01098088a1950eed0db01aa132967ab472235f5642483b25eaf"],["80c60ad0040f27dade5b4b06c408e56b2c50e9f56b9b8b425e555c2f86308b6f","1c38303f1cc5c30f26e66bad7fe72f70a65eed4cbe7024eb1aa01f56430bd57a"],["7a9375ad6167ad54aa74c6348cc54d344cc5dc9487d847049d5eabb0fa03c8fb","d0e3fa9eca8726909559e0d79269046bdc59ea10c70ce2b02d499ec224dc7f7"],["d528ecd9b696b54c907a9ed045447a79bb408ec39b68df504bb51f459bc3ffc9","eecf41253136e5f99966f21881fd656ebc4345405c520dbc063465b521409933"],["49370a4b5f43412ea25f514e8ecdad05266115e4a7ecb1387231808f8b45963","758f3f41afd6ed428b3081b0512fd62a54c3f3afbb5b6764b653052a12949c9a"],["77f230936ee88cbbd73df930d64702ef881d811e0e1498e2f1c13eb1fc345d74","958ef42a7886b6400a08266e9ba1b37896c95330d97077cbbe8eb3c7671c60d6"],["f2dac991cc4ce4b9ea44887e5c7c0bce58c80074ab9d4dbaeb28531b7739f530","e0dedc9b3b2f8dad4da1f32dec2531df9eb5fbeb0598e4fd1a117dba703a3c37"],["463b3d9f662621fb1b4be8fbbe2520125a216cdfc9dae3debcba4850c690d45b","5ed430d78c296c3543114306dd8622d7c622e27c970a1de31cb377b01af7307e"],["f16f804244e46e2a09232d4aff3b59976b98fac14328a2d1a32496b49998f247","cedabd9b82203f7e13d206fcdf4e33d92a6c53c26e5cce26d6579962c4e31df6"],["caf754272dc84563b0352b7a14311af55d245315ace27c65369e15f7151d41d1","cb474660ef35f5f2a41b643fa5e460575f4fa9b7962232a5c32f908318a04476"],["2600ca4b282cb986f85d0f1709979d8b44a09c07cb86d7c124497bc86f082120","4119b88753c15bd6a693b03fcddbb45d5ac6be74ab5f0ef44b0be9475a7e4b40"],["7635ca72d7e8432c338ec53cd12220bc01c48685e24f7dc8c602a7746998e435","91b649609489d613d1d5e590f78e6d74ecfc061d57048bad9e76f302c5b9c61"],["754e3239f325570cdbbf4a87deee8a66b7f2b33479d468fbc1a50743bf56cc18","673fb86e5bda30fb3cd0ed304ea49a023ee33d0197a695d0c5d98093c536683"],["e3e6bd1071a1e96aff57859c82d570f0330800661d1c952f9fe2694691d9b9e8","59c9e0bba394e76f40c0aa58379a3cb6a5a2283993e90c4167002af4920e37f5"],["186b483d056a033826ae73d88f732985c4ccb1f32ba35f4b4cc47fdcf04aa6eb","3b952d32c67cf77e2e17446e204180ab21fb8090895138b4a4a797f86e80888b"],["df9d70a6b9876ce544c98561f4be4f725442e6d2b737d9c91a8321724ce0963f","55eb2dafd84d6ccd5f862b785dc39d4ab157222720ef9da217b8c45cf2ba2417"],["5edd5cc23c51e87a497ca815d5dce0f8ab52554f849ed8995de64c5f34ce7143","efae9c8dbc14130661e8cec030c89ad0c13c66c0d17a2905cdc706ab7399a868"],["290798c2b6476830da12fe02287e9e777aa3fba1c355b17a722d362f84614fba","e38da76dcd440621988d00bcf79af25d5b29c094db2a23146d003afd41943e7a"],["af3c423a95d9f5b3054754efa150ac39cd29552fe360257362dfdecef4053b45","f98a3fd831eb2b749a93b0e6f35cfb40c8cd5aa667a15581bc2feded498fd9c6"],["766dbb24d134e745cccaa28c99bf274906bb66b26dcf98df8d2fed50d884249a","744b1152eacbe5e38dcc887980da38b897584a65fa06cedd2c924f97cbac5996"],["59dbf46f8c94759ba21277c33784f41645f7b44f6c596a58ce92e666191abe3e","c534ad44175fbc300f4ea6ce648309a042ce739a7919798cd85e216c4a307f6e"],["f13ada95103c4537305e691e74e9a4a8dd647e711a95e73cb62dc6018cfd87b8","e13817b44ee14de663bf4bc808341f326949e21a6a75c2570778419bdaf5733d"],["7754b4fa0e8aced06d4167a2c59cca4cda1869c06ebadfb6488550015a88522c","30e93e864e669d82224b967c3020b8fa8d1e4e350b6cbcc537a48b57841163a2"],["948dcadf5990e048aa3874d46abef9d701858f95de8041d2a6828c99e2262519","e491a42537f6e597d5d28a3224b1bc25df9154efbd2ef1d2cbba2cae5347d57e"],["7962414450c76c1689c7b48f8202ec37fb224cf5ac0bfa1570328a8a3d7c77ab","100b610ec4ffb4760d5c1fc133ef6f6b12507a051f04ac5760afa5b29db83437"],["3514087834964b54b15b160644d915485a16977225b8847bb0dd085137ec47ca","ef0afbb2056205448e1652c48e8127fc6039e77c15c2378b7e7d15a0de293311"],["d3cc30ad6b483e4bc79ce2c9dd8bc54993e947eb8df787b442943d3f7b527eaf","8b378a22d827278d89c5e9be8f9508ae3c2ad46290358630afb34db04eede0a4"],["1624d84780732860ce1c78fcbfefe08b2b29823db913f6493975ba0ff4847610","68651cf9b6da903e0914448c6cd9d4ca896878f5282be4c8cc06e2a404078575"],["733ce80da955a8a26902c95633e62a985192474b5af207da6df7b4fd5fc61cd4","f5435a2bd2badf7d485a4d8b8db9fcce3e1ef8e0201e4578c54673bc1dc5ea1d"],["15d9441254945064cf1a1c33bbd3b49f8966c5092171e699ef258dfab81c045c","d56eb30b69463e7234f5137b73b84177434800bacebfc685fc37bbe9efe4070d"],["a1d0fcf2ec9de675b612136e5ce70d271c21417c9d2b8aaaac138599d0717940","edd77f50bcb5a3cab2e90737309667f2641462a54070f3d519212d39c197a629"],["e22fbe15c0af8ccc5780c0735f84dbe9a790badee8245c06c7ca37331cb36980","a855babad5cd60c88b430a69f53a1a7a38289154964799be43d06d77d31da06"],["311091dd9860e8e20ee13473c1155f5f69635e394704eaa74009452246cfa9b3","66db656f87d1f04fffd1f04788c06830871ec5a64feee685bd80f0b1286d8374"],["34c1fd04d301be89b31c0442d3e6ac24883928b45a9340781867d4232ec2dbdf","9414685e97b1b5954bd46f730174136d57f1ceeb487443dc5321857ba73abee"],["f219ea5d6b54701c1c14de5b557eb42a8d13f3abbcd08affcc2a5e6b049b8d63","4cb95957e83d40b0f73af4544cccf6b1f4b08d3c07b27fb8d8c2962a400766d1"],["d7b8740f74a8fbaab1f683db8f45de26543a5490bca627087236912469a0b448","fa77968128d9c92ee1010f337ad4717eff15db5ed3c049b3411e0315eaa4593b"],["32d31c222f8f6f0ef86f7c98d3a3335ead5bcd32abdd94289fe4d3091aa824bf","5f3032f5892156e39ccd3d7915b9e1da2e6dac9e6f26e961118d14b8462e1661"],["7461f371914ab32671045a155d9831ea8793d77cd59592c4340f86cbc18347b5","8ec0ba238b96bec0cbdddcae0aa442542eee1ff50c986ea6b39847b3cc092ff6"],["ee079adb1df1860074356a25aa38206a6d716b2c3e67453d287698bad7b2b2d6","8dc2412aafe3be5c4c5f37e0ecc5f9f6a446989af04c4e25ebaac479ec1c8c1e"],["16ec93e447ec83f0467b18302ee620f7e65de331874c9dc72bfd8616ba9da6b5","5e4631150e62fb40d0e8c2a7ca5804a39d58186a50e497139626778e25b0674d"],["eaa5f980c245f6f038978290afa70b6bd8855897f98b6aa485b96065d537bd99","f65f5d3e292c2e0819a528391c994624d784869d7e6ea67fb18041024edc07dc"],["78c9407544ac132692ee1910a02439958ae04877151342ea96c4b6b35a49f51","f3e0319169eb9b85d5404795539a5e68fa1fbd583c064d2462b675f194a3ddb4"],["494f4be219a1a77016dcd838431aea0001cdc8ae7a6fc688726578d9702857a5","42242a969283a5f339ba7f075e36ba2af925ce30d767ed6e55f4b031880d562c"],["a598a8030da6d86c6bc7f2f5144ea549d28211ea58faa70ebf4c1e665c1fe9b5","204b5d6f84822c307e4b4a7140737aec23fc63b65b35f86a10026dbd2d864e6b"],["c41916365abb2b5d09192f5f2dbeafec208f020f12570a184dbadc3e58595997","4f14351d0087efa49d245b328984989d5caf9450f34bfc0ed16e96b58fa9913"],["841d6063a586fa475a724604da03bc5b92a2e0d2e0a36acfe4c73a5514742881","73867f59c0659e81904f9a1c7543698e62562d6744c169ce7a36de01a8d6154"],["5e95bb399a6971d376026947f89bde2f282b33810928be4ded112ac4d70e20d5","39f23f366809085beebfc71181313775a99c9aed7d8ba38b161384c746012865"],["36e4641a53948fd476c39f8a99fd974e5ec07564b5315d8bf99471bca0ef2f66","d2424b1b1abe4eb8164227b085c9aa9456ea13493fd563e06fd51cf5694c78fc"],["336581ea7bfbbb290c191a2f507a41cf5643842170e914faeab27c2c579f726","ead12168595fe1be99252129b6e56b3391f7ab1410cd1e0ef3dcdcabd2fda224"],["8ab89816dadfd6b6a1f2634fcf00ec8403781025ed6890c4849742706bd43ede","6fdcef09f2f6d0a044e654aef624136f503d459c3e89845858a47a9129cdd24e"],["1e33f1a746c9c5778133344d9299fcaa20b0938e8acff2544bb40284b8c5fb94","60660257dd11b3aa9c8ed618d24edff2306d320f1d03010e33a7d2057f3b3b6"],["85b7c1dcb3cec1b7ee7f30ded79dd20a0ed1f4cc18cbcfcfa410361fd8f08f31","3d98a9cdd026dd43f39048f25a8847f4fcafad1895d7a633c6fed3c35e999511"],["29df9fbd8d9e46509275f4b125d6d45d7fbe9a3b878a7af872a2800661ac5f51","b4c4fe99c775a606e2d8862179139ffda61dc861c019e55cd2876eb2a27d84b"],["a0b1cae06b0a847a3fea6e671aaf8adfdfe58ca2f768105c8082b2e449fce252","ae434102edde0958ec4b19d917a6a28e6b72da1834aff0e650f049503a296cf2"],["4e8ceafb9b3e9a136dc7ff67e840295b499dfb3b2133e4ba113f2e4c0e121e5","cf2174118c8b6d7a4b48f6d534ce5c79422c086a63460502b827ce62a326683c"],["d24a44e047e19b6f5afb81c7ca2f69080a5076689a010919f42725c2b789a33b","6fb8d5591b466f8fc63db50f1c0f1c69013f996887b8244d2cdec417afea8fa3"],["ea01606a7a6c9cdd249fdfcfacb99584001edd28abbab77b5104e98e8e3b35d4","322af4908c7312b0cfbfe369f7a7b3cdb7d4494bc2823700cfd652188a3ea98d"],["af8addbf2b661c8a6c6328655eb96651252007d8c5ea31be4ad196de8ce2131f","6749e67c029b85f52a034eafd096836b2520818680e26ac8f3dfbcdb71749700"],["e3ae1974566ca06cc516d47e0fb165a674a3dabcfca15e722f0e3450f45889","2aeabe7e4531510116217f07bf4d07300de97e4874f81f533420a72eeb0bd6a4"],["591ee355313d99721cf6993ffed1e3e301993ff3ed258802075ea8ced397e246","b0ea558a113c30bea60fc4775460c7901ff0b053d25ca2bdeee98f1a4be5d196"],["11396d55fda54c49f19aa97318d8da61fa8584e47b084945077cf03255b52984","998c74a8cd45ac01289d5833a7beb4744ff536b01b257be4c5767bea93ea57a4"],["3c5d2a1ba39c5a1790000738c9e0c40b8dcdfd5468754b6405540157e017aa7a","b2284279995a34e2f9d4de7396fc18b80f9b8b9fdd270f6661f79ca4c81bd257"],["cc8704b8a60a0defa3a99a7299f2e9c3fbc395afb04ac078425ef8a1793cc030","bdd46039feed17881d1e0862db347f8cf395b74fc4bcdc4e940b74e3ac1f1b13"],["c533e4f7ea8555aacd9777ac5cad29b97dd4defccc53ee7ea204119b2889b197","6f0a256bc5efdf429a2fb6242f1a43a2d9b925bb4a4b3a26bb8e0f45eb596096"],["c14f8f2ccb27d6f109f6d08d03cc96a69ba8c34eec07bbcf566d48e33da6593","c359d6923bb398f7fd4473e16fe1c28475b740dd098075e6c0e8649113dc3a38"],["a6cbc3046bc6a450bac24789fa17115a4c9739ed75f8f21ce441f72e0b90e6ef","21ae7f4680e889bb130619e2c0f95a360ceb573c70603139862afd617fa9b9f"],["347d6d9a02c48927ebfb86c1359b1caf130a3c0267d11ce6344b39f99d43cc38","60ea7f61a353524d1c987f6ecec92f086d565ab687870cb12689ff1e31c74448"],["da6545d2181db8d983f7dcb375ef5866d47c67b1bf31c8cf855ef7437b72656a","49b96715ab6878a79e78f07ce5680c5d6673051b4935bd897fea824b77dc208a"],["c40747cc9d012cb1a13b8148309c6de7ec25d6945d657146b9d5994b8feb1111","5ca560753be2a12fc6de6caf2cb489565db936156b9514e1bb5e83037e0fa2d4"],["4e42c8ec82c99798ccf3a610be870e78338c7f713348bd34c8203ef4037f3502","7571d74ee5e0fb92a7a8b33a07783341a5492144cc54bcc40a94473693606437"],["3775ab7089bc6af823aba2e1af70b236d251cadb0c86743287522a1b3b0dedea","be52d107bcfa09d8bcb9736a828cfa7fac8db17bf7a76a2c42ad961409018cf7"],["cee31cbf7e34ec379d94fb814d3d775ad954595d1314ba8846959e3e82f74e26","8fd64a14c06b589c26b947ae2bcf6bfa0149ef0be14ed4d80f448a01c43b1c6d"],["b4f9eaea09b6917619f6ea6a4eb5464efddb58fd45b1ebefcdc1a01d08b47986","39e5c9925b5a54b07433a4f18c61726f8bb131c012ca542eb24a8ac07200682a"],["d4263dfc3d2df923a0179a48966d30ce84e2515afc3dccc1b77907792ebcc60e","62dfaf07a0f78feb30e30d6295853ce189e127760ad6cf7fae164e122a208d54"],["48457524820fa65a4f8d35eb6930857c0032acc0a4a2de422233eeda897612c4","25a748ab367979d98733c38a1fa1c2e7dc6cc07db2d60a9ae7a76aaa49bd0f77"],["dfeeef1881101f2cb11644f3a2afdfc2045e19919152923f367a1767c11cceda","ecfb7056cf1de042f9420bab396793c0c390bde74b4bbdff16a83ae09a9a7517"],["6d7ef6b17543f8373c573f44e1f389835d89bcbc6062ced36c82df83b8fae859","cd450ec335438986dfefa10c57fea9bcc521a0959b2d80bbf74b190dca712d10"],["e75605d59102a5a2684500d3b991f2e3f3c88b93225547035af25af66e04541f","f5c54754a8f71ee540b9b48728473e314f729ac5308b06938360990e2bfad125"],["eb98660f4c4dfaa06a2be453d5020bc99a0c2e60abe388457dd43fefb1ed620c","6cb9a8876d9cb8520609af3add26cd20a0a7cd8a9411131ce85f44100099223e"],["13e87b027d8514d35939f2e6892b19922154596941888336dc3563e3b8dba942","fef5a3c68059a6dec5d624114bf1e91aac2b9da568d6abeb2570d55646b8adf1"],["ee163026e9fd6fe017c38f06a5be6fc125424b371ce2708e7bf4491691e5764a","1acb250f255dd61c43d94ccc670d0f58f49ae3fa15b96623e5430da0ad6c62b2"],["b268f5ef9ad51e4d78de3a750c2dc89b1e626d43505867999932e5db33af3d80","5f310d4b3c99b9ebb19f77d41c1dee018cf0d34fd4191614003e945a1216e423"],["ff07f3118a9df035e9fad85eb6c7bfe42b02f01ca99ceea3bf7ffdba93c4750d","438136d603e858a3a5c440c38eccbaddc1d2942114e2eddd4740d098ced1f0d8"],["8d8b9855c7c052a34146fd20ffb658bea4b9f69e0d825ebec16e8c3ce2b526a1","cdb559eedc2d79f926baf44fb84ea4d44bcf50fee51d7ceb30e2e7f463036758"],["52db0b5384dfbf05bfa9d472d7ae26dfe4b851ceca91b1eba54263180da32b63","c3b997d050ee5d423ebaf66a6db9f57b3180c902875679de924b69d84a7b375"],["e62f9490d3d51da6395efd24e80919cc7d0f29c3f3fa48c6fff543becbd43352","6d89ad7ba4876b0b22c2ca280c682862f342c8591f1daf5170e07bfd9ccafa7d"],["7f30ea2476b399b4957509c88f77d0191afa2ff5cb7b14fd6d8e7d65aaab1193","ca5ef7d4b231c94c3b15389a5f6311e9daff7bb67b103e9880ef4bff637acaec"],["5098ff1e1d9f14fb46a210fada6c903fef0fb7b4a1dd1d9ac60a0361800b7a00","9731141d81fc8f8084d37c6e7542006b3ee1b40d60dfe5362a5b132fd17ddc0"],["32b78c7de9ee512a72895be6b9cbefa6e2f3c4ccce445c96b9f2c81e2778ad58","ee1849f513df71e32efc3896ee28260c73bb80547ae2275ba497237794c8753c"],["e2cb74fddc8e9fbcd076eef2a7c72b0ce37d50f08269dfc074b581550547a4f7","d3aa2ed71c9dd2247a62df062736eb0baddea9e36122d2be8641abcb005cc4a4"],["8438447566d4d7bedadc299496ab357426009a35f235cb141be0d99cd10ae3a8","c4e1020916980a4da5d01ac5e6ad330734ef0d7906631c4f2390426b2edd791f"],["4162d488b89402039b584c6fc6c308870587d9c46f660b878ab65c82c711d67e","67163e903236289f776f22c25fb8a3afc1732f2b84b4e95dbda47ae5a0852649"],["3fad3fa84caf0f34f0f89bfd2dcf54fc175d767aec3e50684f3ba4a4bf5f683d","cd1bc7cb6cc407bb2f0ca647c718a730cf71872e7d0d2a53fa20efcdfe61826"],["674f2600a3007a00568c1a7ce05d0816c1fb84bf1370798f1c69532faeb1a86b","299d21f9413f33b3edf43b257004580b70db57da0b182259e09eecc69e0d38a5"],["d32f4da54ade74abb81b815ad1fb3b263d82d6c692714bcff87d29bd5ee9f08f","f9429e738b8e53b968e99016c059707782e14f4535359d582fc416910b3eea87"],["30e4e670435385556e593657135845d36fbb6931f72b08cb1ed954f1e3ce3ff6","462f9bce619898638499350113bbc9b10a878d35da70740dc695a559eb88db7b"],["be2062003c51cc3004682904330e4dee7f3dcd10b01e580bf1971b04d4cad297","62188bc49d61e5428573d48a74e1c655b1c61090905682a0d5558ed72dccb9bc"],["93144423ace3451ed29e0fb9ac2af211cb6e84a601df5993c419859fff5df04a","7c10dfb164c3425f5c71a3f9d7992038f1065224f72bb9d1d902a6d13037b47c"],["b015f8044f5fcbdcf21ca26d6c34fb8197829205c7b7d2a7cb66418c157b112c","ab8c1e086d04e813744a655b2df8d5f83b3cdc6faa3088c1d3aea1454e3a1d5f"],["d5e9e1da649d97d89e4868117a465a3a4f8a18de57a140d36b3f2af341a21b52","4cb04437f391ed73111a13cc1d4dd0db1693465c2240480d8955e8592f27447a"],["d3ae41047dd7ca065dbf8ed77b992439983005cd72e16d6f996a5316d36966bb","bd1aeb21ad22ebb22a10f0303417c6d964f8cdd7df0aca614b10dc14d125ac46"],["463e2763d885f958fc66cdd22800f0a487197d0a82e377b49f80af87c897b065","bfefacdb0e5d0fd7df3a311a94de062b26b80c61fbc97508b79992671ef7ca7f"],["7985fdfd127c0567c6f53ec1bb63ec3158e597c40bfe747c83cddfc910641917","603c12daf3d9862ef2b25fe1de289aed24ed291e0ec6708703a5bd567f32ed03"],["74a1ad6b5f76e39db2dd249410eac7f99e74c59cb83d2d0ed5ff1543da7703e9","cc6157ef18c9c63cd6193d83631bbea0093e0968942e8c33d5737fd790e0db08"],["30682a50703375f602d416664ba19b7fc9bab42c72747463a71d0896b22f6da3","553e04f6b018b4fa6c8f39e7f311d3176290d0e0f19ca73f17714d9977a22ff8"],["9e2158f0d7c0d5f26c3791efefa79597654e7a2b2464f52b1ee6c1347769ef57","712fcdd1b9053f09003a3481fa7762e9ffd7c8ef35a38509e2fbf2629008373"],["176e26989a43c9cfeba4029c202538c28172e566e3c4fce7322857f3be327d66","ed8cc9d04b29eb877d270b4878dc43c19aefd31f4eee09ee7b47834c1fa4b1c3"],["75d46efea3771e6e68abb89a13ad747ecf1892393dfc4f1b7004788c50374da8","9852390a99507679fd0b86fd2b39a868d7efc22151346e1a3ca4726586a6bed8"],["809a20c67d64900ffb698c4c825f6d5f2310fb0451c869345b7319f645605721","9e994980d9917e22b76b061927fa04143d096ccc54963e6a5ebfa5f3f8e286c1"],["1b38903a43f7f114ed4500b4eac7083fdefece1cf29c63528d563446f972c180","4036edc931a60ae889353f77fd53de4a2708b26b6f5da72ad3394119daf408f9"]]}}},function(t,e,r){"use strict";var n=r(2),i=r(136),o=r(4),a=o.utils.assert,f=r(137),s=r(138);function c(t){if(!(this instanceof c))return new c(t);"string"==typeof t&&(a(o.curves.hasOwnProperty(t),"Unknown curve "+t),t=o.curves[t]),t instanceof o.curves.PresetCurve&&(t={curve:t}),this.curve=t.curve.curve,this.n=this.curve.n,this.nh=this.n.ushrn(1),this.g=this.curve.g,this.g=t.curve.g,this.g.precompute(t.curve.n.bitLength()+1),this.hash=t.hash||t.curve.hash}t.exports=c,c.prototype.keyPair=function(t){return new f(this,t)},c.prototype.keyFromPrivate=function(t,e){return f.fromPrivate(this,t,e)},c.prototype.keyFromPublic=function(t,e){return f.fromPublic(this,t,e)},c.prototype.genKeyPair=function(t){t||(t={});for(var e=new i({hash:this.hash,pers:t.pers,persEnc:t.persEnc||"utf8",entropy:t.entropy||o.rand(this.hash.hmacStrength),entropyEnc:t.entropy&&t.entropyEnc||"utf8",nonce:this.n.toArray()}),r=this.n.byteLength(),a=this.n.sub(new n(2));;){var f=new n(e.generate(r));if(!(f.cmp(a)>0))return f.iaddn(1),this.keyFromPrivate(f)}},c.prototype._truncateToN=function(t,e){var r=8*t.byteLength()-this.n.bitLength();return r>0&&(t=t.ushrn(r)),!e&&t.cmp(this.n)>=0?t.sub(this.n):t},c.prototype.sign=function(t,e,r,o){"object"==typeof r&&(o=r,r=null),o||(o={}),e=this.keyFromPrivate(e,r),t=this._truncateToN(new n(t,16));for(var a=this.n.byteLength(),f=e.getPrivate().toArray("be",a),c=t.toArray("be",a),u=new i({hash:this.hash,entropy:f,nonce:c,pers:o.pers,persEnc:o.persEnc||"utf8"}),h=this.n.sub(new n(1)),d=0;;d++){var l=o.k?o.k(d):new n(u.generate(this.n.byteLength()));if(!((l=this._truncateToN(l,!0)).cmpn(1)<=0||l.cmp(h)>=0)){var p=this.g.mul(l);if(!p.isInfinity()){var b=p.getX(),y=b.umod(this.n);if(0!==y.cmpn(0)){var v=l.invm(this.n).mul(y.mul(e.getPrivate()).iadd(t));if(0!==(v=v.umod(this.n)).cmpn(0)){var g=(p.getY().isOdd()?1:0)|(0!==b.cmp(y)?2:0);return o.canonical&&v.cmp(this.nh)>0&&(v=this.n.sub(v),g^=1),new s({r:y,s:v,recoveryParam:g})}}}}}},c.prototype.verify=function(t,e,r,i){t=this._truncateToN(new n(t,16)),r=this.keyFromPublic(r,i);var o=(e=new s(e,"hex")).r,a=e.s;if(o.cmpn(1)<0||o.cmp(this.n)>=0)return!1;if(a.cmpn(1)<0||a.cmp(this.n)>=0)return!1;var f,c=a.invm(this.n),u=c.mul(t).umod(this.n),h=c.mul(o).umod(this.n);return this.curve._maxwellTrick?!(f=this.g.jmulAdd(u,r.getPublic(),h)).isInfinity()&&f.eqXToP(o):!(f=this.g.mulAdd(u,r.getPublic(),h)).isInfinity()&&0===f.getX().umod(this.n).cmp(o)},c.prototype.recoverPubKey=function(t,e,r,i){a((3&r)===r,"The recovery param is more than two bits"),e=new s(e,i);var o=this.n,f=new n(t),c=e.r,u=e.s,h=1&r,d=r>>1;if(c.cmp(this.curve.p.umod(this.curve.n))>=0&&d)throw new Error("Unable to find sencond key candinate");c=d?this.curve.pointFromX(c.add(this.curve.n),h):this.curve.pointFromX(c,h);var l=e.r.invm(o),p=o.sub(f).mul(l).umod(o),b=u.mul(l).umod(o);return this.g.mulAdd(p,c,b)},c.prototype.getKeyRecoveryParam=function(t,e,r,n){if(null!==(e=new s(e,n)).recoveryParam)return e.recoveryParam;for(var i=0;i<4;i++){var o;try{o=this.recoverPubKey(t,e,i)}catch(t){continue}if(o.eq(r))return i}throw new Error("Unable to find valid recovery factor")}},function(t,e,r){"use strict";var n=r(36),i=r(60),o=r(5);function a(t){if(!(this instanceof a))return new a(t);this.hash=t.hash,this.predResist=!!t.predResist,this.outLen=this.hash.outSize,this.minEntropy=t.minEntropy||this.hash.hmacStrength,this._reseed=null,this.reseedInterval=null,this.K=null,this.V=null;var e=i.toArray(t.entropy,t.entropyEnc||"hex"),r=i.toArray(t.nonce,t.nonceEnc||"hex"),n=i.toArray(t.pers,t.persEnc||"hex");o(e.length>=this.minEntropy/8,"Not enough entropy. Minimum is: "+this.minEntropy+" bits"),this._init(e,r,n)}t.exports=a,a.prototype._init=function(t,e,r){var n=t.concat(e).concat(r);this.K=new Array(this.outLen/8),this.V=new Array(this.outLen/8);for(var i=0;i<this.V.length;i++)this.K[i]=0,this.V[i]=1;this._update(n),this._reseed=1,this.reseedInterval=281474976710656},a.prototype._hmac=function(){return new n.hmac(this.hash,this.K)},a.prototype._update=function(t){var e=this._hmac().update(this.V).update([0]);t&&(e=e.update(t)),this.K=e.digest(),this.V=this._hmac().update(this.V).digest(),t&&(this.K=this._hmac().update(this.V).update([1]).update(t).digest(),this.V=this._hmac().update(this.V).digest())},a.prototype.reseed=function(t,e,r,n){"string"!=typeof e&&(n=r,r=e,e=null),t=i.toArray(t,e),r=i.toArray(r,n),o(t.length>=this.minEntropy/8,"Not enough entropy. Minimum is: "+this.minEntropy+" bits"),this._update(t.concat(r||[])),this._reseed=1},a.prototype.generate=function(t,e,r,n){if(this._reseed>this.reseedInterval)throw new Error("Reseed is required");"string"!=typeof e&&(n=r,r=e,e=null),r&&(r=i.toArray(r,n||"hex"),this._update(r));for(var o=[];o.length<t;)this.V=this._hmac().update(this.V).digest(),o=o.concat(this.V);var a=o.slice(0,t);return this._update(r),this._reseed++,i.encode(a,e)}},function(t,e,r){"use strict";var n=r(2),i=r(4).utils.assert;function o(t,e){this.ec=t,this.priv=null,this.pub=null,e.priv&&this._importPrivate(e.priv,e.privEnc),e.pub&&this._importPublic(e.pub,e.pubEnc)}t.exports=o,o.fromPublic=function(t,e,r){return e instanceof o?e:new o(t,{pub:e,pubEnc:r})},o.fromPrivate=function(t,e,r){return e instanceof o?e:new o(t,{priv:e,privEnc:r})},o.prototype.validate=function(){var t=this.getPublic();return t.isInfinity()?{result:!1,reason:"Invalid public key"}:t.validate()?t.mul(this.ec.curve.n).isInfinity()?{result:!0,reason:null}:{result:!1,reason:"Public key * N != O"}:{result:!1,reason:"Public key is not a point"}},o.prototype.getPublic=function(t,e){return"string"==typeof t&&(e=t,t=null),this.pub||(this.pub=this.ec.g.mul(this.priv)),e?this.pub.encode(e,t):this.pub},o.prototype.getPrivate=function(t){return"hex"===t?this.priv.toString(16,2):this.priv},o.prototype._importPrivate=function(t,e){this.priv=new n(t,e||16),this.priv=this.priv.umod(this.ec.curve.n)},o.prototype._importPublic=function(t,e){if(t.x||t.y)return"mont"===this.ec.curve.type?i(t.x,"Need x coordinate"):"short"!==this.ec.curve.type&&"edwards"!==this.ec.curve.type||i(t.x&&t.y,"Need both x and y coordinate"),void(this.pub=this.ec.curve.point(t.x,t.y));this.pub=this.ec.curve.decodePoint(t,e)},o.prototype.derive=function(t){return t.mul(this.priv).getX()},o.prototype.sign=function(t,e,r){return this.ec.sign(t,this,e,r)},o.prototype.verify=function(t,e){return this.ec.verify(t,e,this)},o.prototype.inspect=function(){return"<Key priv: "+(this.priv&&this.priv.toString(16,2))+" pub: "+(this.pub&&this.pub.inspect())+" >"}},function(t,e,r){"use strict";var n=r(2),i=r(4).utils,o=i.assert;function a(t,e){if(t instanceof a)return t;this._importDER(t,e)||(o(t.r&&t.s,"Signature without r or s"),this.r=new n(t.r,16),this.s=new n(t.s,16),void 0===t.recoveryParam?this.recoveryParam=null:this.recoveryParam=t.recoveryParam)}function f(t,e){var r=t[e.place++];if(!(128&r))return r;for(var n=15&r,i=0,o=0,a=e.place;o<n;o++,a++)i<<=8,i|=t[a];return e.place=a,i}function s(t){for(var e=0,r=t.length-1;!t[e]&&!(128&t[e+1])&&e<r;)e++;return 0===e?t:t.slice(e)}function c(t,e){if(e<128)t.push(e);else{var r=1+(Math.log(e)/Math.LN2>>>3);for(t.push(128|r);--r;)t.push(e>>>(r<<3)&255);t.push(e)}}t.exports=a,a.prototype._importDER=function(t,e){t=i.toArray(t,e);var r=new function(){this.place=0};if(48!==t[r.place++])return!1;if(f(t,r)+r.place!==t.length)return!1;if(2!==t[r.place++])return!1;var o=f(t,r),a=t.slice(r.place,o+r.place);if(r.place+=o,2!==t[r.place++])return!1;var s=f(t,r);if(t.length!==s+r.place)return!1;var c=t.slice(r.place,s+r.place);return 0===a[0]&&128&a[1]&&(a=a.slice(1)),0===c[0]&&128&c[1]&&(c=c.slice(1)),this.r=new n(a),this.s=new n(c),this.recoveryParam=null,!0},a.prototype.toDER=function(t){var e=this.r.toArray(),r=this.s.toArray();for(128&e[0]&&(e=[0].concat(e)),128&r[0]&&(r=[0].concat(r)),e=s(e),r=s(r);!(r[0]||128&r[1]);)r=r.slice(1);var n=[2];c(n,e.length),(n=n.concat(e)).push(2),c(n,r.length);var o=n.concat(r),a=[48];return c(a,o.length),a=a.concat(o),i.encode(a,t)}},function(t,e,r){"use strict";var n=r(36),i=r(4),o=i.utils,a=o.assert,f=o.parseBytes,s=r(140),c=r(141);function u(t){if(a("ed25519"===t,"only tested with ed25519 so far"),!(this instanceof u))return new u(t);t=i.curves[t].curve,this.curve=t,this.g=t.g,this.g.precompute(t.n.bitLength()+1),this.pointClass=t.point().constructor,this.encodingLength=Math.ceil(t.n.bitLength()/8),this.hash=n.sha512}t.exports=u,u.prototype.sign=function(t,e){t=f(t);var r=this.keyFromSecret(e),n=this.hashInt(r.messagePrefix(),t),i=this.g.mul(n),o=this.encodePoint(i),a=this.hashInt(o,r.pubBytes(),t).mul(r.priv()),s=n.add(a).umod(this.curve.n);return this.makeSignature({R:i,S:s,Rencoded:o})},u.prototype.verify=function(t,e,r){t=f(t),e=this.makeSignature(e);var n=this.keyFromPublic(r),i=this.hashInt(e.Rencoded(),n.pubBytes(),t),o=this.g.mul(e.S());return e.R().add(n.pub().mul(i)).eq(o)},u.prototype.hashInt=function(){for(var t=this.hash(),e=0;e<arguments.length;e++)t.update(arguments[e]);return o.intFromLE(t.digest()).umod(this.curve.n)},u.prototype.keyFromPublic=function(t){return s.fromPublic(this,t)},u.prototype.keyFromSecret=function(t){return s.fromSecret(this,t)},u.prototype.makeSignature=function(t){return t instanceof c?t:new c(this,t)},u.prototype.encodePoint=function(t){var e=t.getY().toArray("le",this.encodingLength);return e[this.encodingLength-1]|=t.getX().isOdd()?128:0,e},u.prototype.decodePoint=function(t){var e=(t=o.parseBytes(t)).length-1,r=t.slice(0,e).concat(-129&t[e]),n=0!=(128&t[e]),i=o.intFromLE(r);return this.curve.pointFromY(i,n)},u.prototype.encodeInt=function(t){return t.toArray("le",this.encodingLength)},u.prototype.decodeInt=function(t){return o.intFromLE(t)},u.prototype.isPoint=function(t){return t instanceof this.pointClass}},function(t,e,r){"use strict";var n=r(4).utils,i=n.assert,o=n.parseBytes,a=n.cachedProperty;function f(t,e){this.eddsa=t,this._secret=o(e.secret),t.isPoint(e.pub)?this._pub=e.pub:this._pubBytes=o(e.pub)}f.fromPublic=function(t,e){return e instanceof f?e:new f(t,{pub:e})},f.fromSecret=function(t,e){return e instanceof f?e:new f(t,{secret:e})},f.prototype.secret=function(){return this._secret},a(f,"pubBytes",function(){return this.eddsa.encodePoint(this.pub())}),a(f,"pub",function(){return this._pubBytes?this.eddsa.decodePoint(this._pubBytes):this.eddsa.g.mul(this.priv())}),a(f,"privBytes",function(){var t=this.eddsa,e=this.hash(),r=t.encodingLength-1,n=e.slice(0,t.encodingLength);return n[0]&=248,n[r]&=127,n[r]|=64,n}),a(f,"priv",function(){return this.eddsa.decodeInt(this.privBytes())}),a(f,"hash",function(){return this.eddsa.hash().update(this.secret()).digest()}),a(f,"messagePrefix",function(){return this.hash().slice(this.eddsa.encodingLength)}),f.prototype.sign=function(t){return i(this._secret,"KeyPair can only verify"),this.eddsa.sign(t,this)},f.prototype.verify=function(t,e){return this.eddsa.verify(t,e,this)},f.prototype.getSecret=function(t){return i(this._secret,"KeyPair is public only"),n.encode(this.secret(),t)},f.prototype.getPublic=function(t){return n.encode(this.pubBytes(),t)},t.exports=f},function(t,e,r){"use strict";var n=r(2),i=r(4).utils,o=i.assert,a=i.cachedProperty,f=i.parseBytes;function s(t,e){this.eddsa=t,"object"!=typeof e&&(e=f(e)),Array.isArray(e)&&(e={R:e.slice(0,t.encodingLength),S:e.slice(t.encodingLength)}),o(e.R&&e.S,"Signature without R or S"),t.isPoint(e.R)&&(this._R=e.R),e.S instanceof n&&(this._S=e.S),this._Rencoded=Array.isArray(e.R)?e.R:e.Rencoded,this._Sencoded=Array.isArray(e.S)?e.S:e.Sencoded}a(s,"S",function(){return this.eddsa.decodeInt(this.Sencoded())}),a(s,"R",function(){return this.eddsa.decodePoint(this.Rencoded())}),a(s,"Rencoded",function(){return this.eddsa.encodePoint(this.R())}),a(s,"Sencoded",function(){return this.eddsa.encodeInt(this.S())}),s.prototype.toBytes=function(){return this.Rencoded().concat(this.Sencoded())},s.prototype.toHex=function(){return i.encode(this.toBytes(),"hex").toUpperCase()},t.exports=s},function(t,e,r){"use strict";var n=r(17);e.certificate=r(153);var i=n.define("RSAPrivateKey",function(){this.seq().obj(this.key("version").int(),this.key("modulus").int(),this.key("publicExponent").int(),this.key("privateExponent").int(),this.key("prime1").int(),this.key("prime2").int(),this.key("exponent1").int(),this.key("exponent2").int(),this.key("coefficient").int())});e.RSAPrivateKey=i;var o=n.define("RSAPublicKey",function(){this.seq().obj(this.key("modulus").int(),this.key("publicExponent").int())});e.RSAPublicKey=o;var a=n.define("SubjectPublicKeyInfo",function(){this.seq().obj(this.key("algorithm").use(f),this.key("subjectPublicKey").bitstr())});e.PublicKey=a;var f=n.define("AlgorithmIdentifier",function(){this.seq().obj(this.key("algorithm").objid(),this.key("none").null_().optional(),this.key("curve").objid().optional(),this.key("params").seq().obj(this.key("p").int(),this.key("q").int(),this.key("g").int()).optional())}),s=n.define("PrivateKeyInfo",function(){this.seq().obj(this.key("version").int(),this.key("algorithm").use(f),this.key("subjectPrivateKey").octstr())});e.PrivateKey=s;var c=n.define("EncryptedPrivateKeyInfo",function(){this.seq().obj(this.key("algorithm").seq().obj(this.key("id").objid(),this.key("decrypt").seq().obj(this.key("kde").seq().obj(this.key("id").objid(),this.key("kdeparams").seq().obj(this.key("salt").octstr(),this.key("iters").int())),this.key("cipher").seq().obj(this.key("algo").objid(),this.key("iv").octstr()))),this.key("subjectPrivateKey").octstr())});e.EncryptedPrivateKey=c;var u=n.define("DSAPrivateKey",function(){this.seq().obj(this.key("version").int(),this.key("p").int(),this.key("q").int(),this.key("g").int(),this.key("pub_key").int(),this.key("priv_key").int())});e.DSAPrivateKey=u,e.DSAparam=n.define("DSAparam",function(){this.int()});var h=n.define("ECPrivateKey",function(){this.seq().obj(this.key("version").int(),this.key("privateKey").octstr(),this.key("parameters").optional().explicit(0).use(d),this.key("publicKey").optional().explicit(1).bitstr())});e.ECPrivateKey=h;var d=n.define("ECParameters",function(){this.choice({namedCurve:this.objid()})});e.signature=n.define("signature",function(){this.seq().obj(this.key("r").int(),this.key("s").int())})},function(t,e,r){var n=r(17),i=r(0);function o(t,e){this.name=t,this.body=e,this.decoders={},this.encoders={}}e.define=function(t,e){return new o(t,e)},o.prototype._createNamed=function(t){var e;try{e=r(144).runInThisContext("(function "+this.name+"(entity) {\n  this._initNamed(entity);\n})")}catch(t){e=function(t){this._initNamed(t)}}return i(e,t),e.prototype._initNamed=function(e){t.call(this,e)},new e(this)},o.prototype._getDecoder=function(t){return t=t||"der",this.decoders.hasOwnProperty(t)||(this.decoders[t]=this._createNamed(n.decoders[t])),this.decoders[t]},o.prototype.decode=function(t,e,r){return this._getDecoder(e).decode(t,r)},o.prototype._getEncoder=function(t){return t=t||"der",this.encoders.hasOwnProperty(t)||(this.encoders[t]=this._createNamed(n.encoders[t])),this.encoders[t]},o.prototype.encode=function(t,e,r){return this._getEncoder(e).encode(t,r)}},function(module,exports,__webpack_require__){var indexOf=__webpack_require__(145),Object_keys=function(t){if(Object.keys)return Object.keys(t);var e=[];for(var r in t)e.push(r);return e},forEach=function(t,e){if(t.forEach)return t.forEach(e);for(var r=0;r<t.length;r++)e(t[r],r,t)},defineProp=function(){try{return Object.defineProperty({},"_",{}),function(t,e,r){Object.defineProperty(t,e,{writable:!0,enumerable:!1,configurable:!0,value:r})}}catch(t){return function(t,e,r){t[e]=r}}}(),globals=["Array","Boolean","Date","Error","EvalError","Function","Infinity","JSON","Math","NaN","Number","Object","RangeError","ReferenceError","RegExp","String","SyntaxError","TypeError","URIError","decodeURI","decodeURIComponent","encodeURI","encodeURIComponent","escape","eval","isFinite","isNaN","parseFloat","parseInt","undefined","unescape"];function Context(){}Context.prototype={};var Script=exports.Script=function(t){if(!(this instanceof Script))return new Script(t);this.code=t};Script.prototype.runInContext=function(t){if(!(t instanceof Context))throw new TypeError("needs a 'context' argument.");var e=document.createElement("iframe");e.style||(e.style={}),e.style.display="none",document.body.appendChild(e);var r=e.contentWindow,n=r.eval,i=r.execScript;!n&&i&&(i.call(r,"null"),n=r.eval),forEach(Object_keys(t),function(e){r[e]=t[e]}),forEach(globals,function(e){t[e]&&(r[e]=t[e])});var o=Object_keys(r),a=n.call(r,this.code);return forEach(Object_keys(r),function(e){(e in t||-1===indexOf(o,e))&&(t[e]=r[e])}),forEach(globals,function(e){e in t||defineProp(t,e,r[e])}),document.body.removeChild(e),a},Script.prototype.runInThisContext=function(){return eval(this.code)},Script.prototype.runInNewContext=function(t){var e=Script.createContext(t),r=this.runInContext(e);return forEach(Object_keys(e),function(r){t[r]=e[r]}),r},forEach(Object_keys(Script.prototype),function(t){exports[t]=Script[t]=function(e){var r=Script(e);return r[t].apply(r,[].slice.call(arguments,1))}}),exports.createScript=function(t){return exports.Script(t)},exports.createContext=Script.createContext=function(t){var e=new Context;return"object"==typeof t&&forEach(Object_keys(t),function(r){e[r]=t[r]}),e}},function(t,e){var r=[].indexOf;t.exports=function(t,e){if(r)return t.indexOf(e);for(var n=0;n<t.length;++n)if(t[n]===e)return n;return-1}},function(t,e,r){var n=r(0);function i(t){this._reporterState={obj:null,path:[],options:t||{},errors:[]}}function o(t,e){this.path=t,this.rethrow(e)}e.Reporter=i,i.prototype.isError=function(t){return t instanceof o},i.prototype.save=function(){var t=this._reporterState;return{obj:t.obj,pathLen:t.path.length}},i.prototype.restore=function(t){var e=this._reporterState;e.obj=t.obj,e.path=e.path.slice(0,t.pathLen)},i.prototype.enterKey=function(t){return this._reporterState.path.push(t)},i.prototype.exitKey=function(t){var e=this._reporterState;e.path=e.path.slice(0,t-1)},i.prototype.leaveKey=function(t,e,r){var n=this._reporterState;this.exitKey(t),null!==n.obj&&(n.obj[e]=r)},i.prototype.path=function(){return this._reporterState.path.join("/")},i.prototype.enterObject=function(){var t=this._reporterState,e=t.obj;return t.obj={},e},i.prototype.leaveObject=function(t){var e=this._reporterState,r=e.obj;return e.obj=t,r},i.prototype.error=function(t){var e,r=this._reporterState,n=t instanceof o;if(e=n?t:new o(r.path.map(function(t){return"["+JSON.stringify(t)+"]"}).join(""),t.message||t,t.stack),!r.options.partial)throw e;return n||r.errors.push(e),e},i.prototype.wrapResult=function(t){var e=this._reporterState;return e.options.partial?{result:this.isError(t)?null:t,errors:e.errors}:t},n(o,Error),o.prototype.rethrow=function(t){if(this.message=t+" at: "+(this.path||"(shallow)"),Error.captureStackTrace&&Error.captureStackTrace(this,o),!this.stack)try{throw new Error(this.message)}catch(t){this.stack=t.stack}return this}},function(t,e,r){var n=r(18).Reporter,i=r(18).EncoderBuffer,o=r(18).DecoderBuffer,a=r(5),f=["seq","seqof","set","setof","objid","bool","gentime","utctime","null_","enum","int","objDesc","bitstr","bmpstr","charstr","genstr","graphstr","ia5str","iso646str","numstr","octstr","printstr","t61str","unistr","utf8str","videostr"],s=["key","obj","use","optional","explicit","implicit","def","choice","any","contains"].concat(f);function c(t,e){var r={};this._baseState=r,r.enc=t,r.parent=e||null,r.children=null,r.tag=null,r.args=null,r.reverseArgs=null,r.choice=null,r.optional=!1,r.any=!1,r.obj=!1,r.use=null,r.useDecoder=null,r.key=null,r.default=null,r.explicit=null,r.implicit=null,r.contains=null,r.parent||(r.children=[],this._wrap())}t.exports=c;var u=["enc","parent","children","tag","args","reverseArgs","choice","optional","any","obj","use","alteredUse","key","default","explicit","implicit","contains"];c.prototype.clone=function(){var t=this._baseState,e={};u.forEach(function(r){e[r]=t[r]});var r=new this.constructor(e.parent);return r._baseState=e,r},c.prototype._wrap=function(){var t=this._baseState;s.forEach(function(e){this[e]=function(){var r=new this.constructor(this);return t.children.push(r),r[e].apply(r,arguments)}},this)},c.prototype._init=function(t){var e=this._baseState;a(null===e.parent),t.call(this),e.children=e.children.filter(function(t){return t._baseState.parent===this},this),a.equal(e.children.length,1,"Root node can have only one child")},c.prototype._useArgs=function(t){var e=this._baseState,r=t.filter(function(t){return t instanceof this.constructor},this);t=t.filter(function(t){return!(t instanceof this.constructor)},this),0!==r.length&&(a(null===e.children),e.children=r,r.forEach(function(t){t._baseState.parent=this},this)),0!==t.length&&(a(null===e.args),e.args=t,e.reverseArgs=t.map(function(t){if("object"!=typeof t||t.constructor!==Object)return t;var e={};return Object.keys(t).forEach(function(r){r==(0|r)&&(r|=0);var n=t[r];e[n]=r}),e}))},["_peekTag","_decodeTag","_use","_decodeStr","_decodeObjid","_decodeTime","_decodeNull","_decodeInt","_decodeBool","_decodeList","_encodeComposite","_encodeStr","_encodeObjid","_encodeTime","_encodeNull","_encodeInt","_encodeBool"].forEach(function(t){c.prototype[t]=function(){var e=this._baseState;throw new Error(t+" not implemented for encoding: "+e.enc)}}),f.forEach(function(t){c.prototype[t]=function(){var e=this._baseState,r=Array.prototype.slice.call(arguments);return a(null===e.tag),e.tag=t,this._useArgs(r),this}}),c.prototype.use=function(t){a(t);var e=this._baseState;return a(null===e.use),e.use=t,this},c.prototype.optional=function(){return this._baseState.optional=!0,this},c.prototype.def=function(t){var e=this._baseState;return a(null===e.default),e.default=t,e.optional=!0,this},c.prototype.explicit=function(t){var e=this._baseState;return a(null===e.explicit&&null===e.implicit),e.explicit=t,this},c.prototype.implicit=function(t){var e=this._baseState;return a(null===e.explicit&&null===e.implicit),e.implicit=t,this},c.prototype.obj=function(){var t=this._baseState,e=Array.prototype.slice.call(arguments);return t.obj=!0,0!==e.length&&this._useArgs(e),this},c.prototype.key=function(t){var e=this._baseState;return a(null===e.key),e.key=t,this},c.prototype.any=function(){return this._baseState.any=!0,this},c.prototype.choice=function(t){var e=this._baseState;return a(null===e.choice),e.choice=t,this._useArgs(Object.keys(t).map(function(e){return t[e]})),this},c.prototype.contains=function(t){var e=this._baseState;return a(null===e.use),e.contains=t,this},c.prototype._decode=function(t,e){var r=this._baseState;if(null===r.parent)return t.wrapResult(r.children[0]._decode(t,e));var n,i=r.default,a=!0,f=null;if(null!==r.key&&(f=t.enterKey(r.key)),r.optional){var s=null;if(null!==r.explicit?s=r.explicit:null!==r.implicit?s=r.implicit:null!==r.tag&&(s=r.tag),null!==s||r.any){if(a=this._peekTag(t,s,r.any),t.isError(a))return a}else{var c=t.save();try{null===r.choice?this._decodeGeneric(r.tag,t,e):this._decodeChoice(t,e),a=!0}catch(t){a=!1}t.restore(c)}}if(r.obj&&a&&(n=t.enterObject()),a){if(null!==r.explicit){var u=this._decodeTag(t,r.explicit);if(t.isError(u))return u;t=u}var h=t.offset;if(null===r.use&&null===r.choice){r.any&&(c=t.save());var d=this._decodeTag(t,null!==r.implicit?r.implicit:r.tag,r.any);if(t.isError(d))return d;r.any?i=t.raw(c):t=d}if(e&&e.track&&null!==r.tag&&e.track(t.path(),h,t.length,"tagged"),e&&e.track&&null!==r.tag&&e.track(t.path(),t.offset,t.length,"content"),i=r.any?i:null===r.choice?this._decodeGeneric(r.tag,t,e):this._decodeChoice(t,e),t.isError(i))return i;if(r.any||null!==r.choice||null===r.children||r.children.forEach(function(r){r._decode(t,e)}),r.contains&&("octstr"===r.tag||"bitstr"===r.tag)){var l=new o(i);i=this._getUse(r.contains,t._reporterState.obj)._decode(l,e)}}return r.obj&&a&&(i=t.leaveObject(n)),null===r.key||null===i&&!0!==a?null!==f&&t.exitKey(f):t.leaveKey(f,r.key,i),i},c.prototype._decodeGeneric=function(t,e,r){var n=this._baseState;return"seq"===t||"set"===t?null:"seqof"===t||"setof"===t?this._decodeList(e,t,n.args[0],r):/str$/.test(t)?this._decodeStr(e,t,r):"objid"===t&&n.args?this._decodeObjid(e,n.args[0],n.args[1],r):"objid"===t?this._decodeObjid(e,null,null,r):"gentime"===t||"utctime"===t?this._decodeTime(e,t,r):"null_"===t?this._decodeNull(e,r):"bool"===t?this._decodeBool(e,r):"objDesc"===t?this._decodeStr(e,t,r):"int"===t||"enum"===t?this._decodeInt(e,n.args&&n.args[0],r):null!==n.use?this._getUse(n.use,e._reporterState.obj)._decode(e,r):e.error("unknown tag: "+t)},c.prototype._getUse=function(t,e){var r=this._baseState;return r.useDecoder=this._use(t,e),a(null===r.useDecoder._baseState.parent),r.useDecoder=r.useDecoder._baseState.children[0],r.implicit!==r.useDecoder._baseState.implicit&&(r.useDecoder=r.useDecoder.clone(),r.useDecoder._baseState.implicit=r.implicit),r.useDecoder},c.prototype._decodeChoice=function(t,e){var r=this._baseState,n=null,i=!1;return Object.keys(r.choice).some(function(o){var a=t.save(),f=r.choice[o];try{var s=f._decode(t,e);if(t.isError(s))return!1;n={type:o,value:s},i=!0}catch(e){return t.restore(a),!1}return!0},this),i?n:t.error("Choice not matched")},c.prototype._createEncoderBuffer=function(t){return new i(t,this.reporter)},c.prototype._encode=function(t,e,r){var n=this._baseState;if(null===n.default||n.default!==t){var i=this._encodeValue(t,e,r);if(void 0!==i&&!this._skipDefault(i,e,r))return i}},c.prototype._encodeValue=function(t,e,r){var i=this._baseState;if(null===i.parent)return i.children[0]._encode(t,e||new n);var o=null;if(this.reporter=e,i.optional&&void 0===t){if(null===i.default)return;t=i.default}var a=null,f=!1;if(i.any)o=this._createEncoderBuffer(t);else if(i.choice)o=this._encodeChoice(t,e);else if(i.contains)a=this._getUse(i.contains,r)._encode(t,e),f=!0;else if(i.children)a=i.children.map(function(r){if("null_"===r._baseState.tag)return r._encode(null,e,t);if(null===r._baseState.key)return e.error("Child should have a key");var n=e.enterKey(r._baseState.key);if("object"!=typeof t)return e.error("Child expected, but input is not object");var i=r._encode(t[r._baseState.key],e,t);return e.leaveKey(n),i},this).filter(function(t){return t}),a=this._createEncoderBuffer(a);else if("seqof"===i.tag||"setof"===i.tag){if(!i.args||1!==i.args.length)return e.error("Too many args for : "+i.tag);if(!Array.isArray(t))return e.error("seqof/setof, but data is not Array");var s=this.clone();s._baseState.implicit=null,a=this._createEncoderBuffer(t.map(function(r){var n=this._baseState;return this._getUse(n.args[0],t)._encode(r,e)},s))}else null!==i.use?o=this._getUse(i.use,r)._encode(t,e):(a=this._encodePrimitive(i.tag,t),f=!0);if(!i.any&&null===i.choice){var c=null!==i.implicit?i.implicit:i.tag,u=null===i.implicit?"universal":"context";null===c?null===i.use&&e.error("Tag could be omitted only for .use()"):null===i.use&&(o=this._encodeComposite(c,f,u,a))}return null!==i.explicit&&(o=this._encodeComposite(i.explicit,!1,"context",o)),o},c.prototype._encodeChoice=function(t,e){var r=this._baseState,n=r.choice[t.type];return n||a(!1,t.type+" not found in "+JSON.stringify(Object.keys(r.choice))),n._encode(t.value,e)},c.prototype._encodePrimitive=function(t,e){var r=this._baseState;if(/str$/.test(t))return this._encodeStr(e,t);if("objid"===t&&r.args)return this._encodeObjid(e,r.reverseArgs[0],r.args[1]);if("objid"===t)return this._encodeObjid(e,null,null);if("gentime"===t||"utctime"===t)return this._encodeTime(e,t);if("null_"===t)return this._encodeNull();if("int"===t||"enum"===t)return this._encodeInt(e,r.args&&r.reverseArgs[0]);if("bool"===t)return this._encodeBool(e);if("objDesc"===t)return this._encodeStr(e,t);throw new Error("Unsupported tag: "+t)},c.prototype._isNumstr=function(t){return/^[0-9 ]*$/.test(t)},c.prototype._isPrintstr=function(t){return/^[A-Za-z0-9 '\(\)\+,\-\.\/:=\?]*$/.test(t)}},function(t,e,r){var n=r(65);e.tagClass={0:"universal",1:"application",2:"context",3:"private"},e.tagClassByName=n._reverse(e.tagClass),e.tag={0:"end",1:"bool",2:"int",3:"bitstr",4:"octstr",5:"null_",6:"objid",7:"objDesc",8:"external",9:"real",10:"enum",11:"embed",12:"utf8str",13:"relativeOid",16:"seq",17:"set",18:"numstr",19:"printstr",20:"t61str",21:"videostr",22:"ia5str",23:"utctime",24:"gentime",25:"graphstr",26:"iso646str",27:"genstr",28:"unistr",29:"charstr",30:"bmpstr"},e.tagByName=n._reverse(e.tag)},function(t,e,r){var n=e;n.der=r(66),n.pem=r(150)},function(t,e,r){var n=r(0),i=r(3).Buffer,o=r(66);function a(t){o.call(this,t),this.enc="pem"}n(a,o),t.exports=a,a.prototype.decode=function(t,e){for(var r=t.toString().split(/[\r\n]+/g),n=e.label.toUpperCase(),a=/^-----(BEGIN|END) ([^-]+)-----$/,f=-1,s=-1,c=0;c<r.length;c++){var u=r[c].match(a);if(null!==u&&u[2]===n){if(-1!==f){if("END"!==u[1])break;s=c;break}if("BEGIN"!==u[1])break;f=c}}if(-1===f||-1===s)throw new Error("PEM section not found for: "+n);var h=r.slice(f+1,s).join("");h.replace(/[^a-z0-9\+\/=]+/gi,"");var d=new i(h,"base64");return o.prototype.decode.call(this,d,e)}},function(t,e,r){var n=e;n.der=r(67),n.pem=r(152)},function(t,e,r){var n=r(0),i=r(67);function o(t){i.call(this,t),this.enc="pem"}n(o,i),t.exports=o,o.prototype.encode=function(t,e){for(var r=i.prototype.encode.call(this,t).toString("base64"),n=["-----BEGIN "+e.label+"-----"],o=0;o<r.length;o+=64)n.push(r.slice(o,o+64));return n.push("-----END "+e.label+"-----"),n.join("\n")}},function(t,e,r){"use strict";var n=r(17),i=n.define("Time",function(){this.choice({utcTime:this.utctime(),generalTime:this.gentime()})}),o=n.define("AttributeTypeValue",function(){this.seq().obj(this.key("type").objid(),this.key("value").any())}),a=n.define("AlgorithmIdentifier",function(){this.seq().obj(this.key("algorithm").objid(),this.key("parameters").optional())}),f=n.define("SubjectPublicKeyInfo",function(){this.seq().obj(this.key("algorithm").use(a),this.key("subjectPublicKey").bitstr())}),s=n.define("RelativeDistinguishedName",function(){this.setof(o)}),c=n.define("RDNSequence",function(){this.seqof(s)}),u=n.define("Name",function(){this.choice({rdnSequence:this.use(c)})}),h=n.define("Validity",function(){this.seq().obj(this.key("notBefore").use(i),this.key("notAfter").use(i))}),d=n.define("Extension",function(){this.seq().obj(this.key("extnID").objid(),this.key("critical").bool().def(!1),this.key("extnValue").octstr())}),l=n.define("TBSCertificate",function(){this.seq().obj(this.key("version").explicit(0).int(),this.key("serialNumber").int(),this.key("signature").use(a),this.key("issuer").use(u),this.key("validity").use(h),this.key("subject").use(u),this.key("subjectPublicKeyInfo").use(f),this.key("issuerUniqueID").implicit(1).bitstr().optional(),this.key("subjectUniqueID").implicit(2).bitstr().optional(),this.key("extensions").explicit(3).seqof(d).optional())}),p=n.define("X509Certificate",function(){this.seq().obj(this.key("tbsCertificate").use(l),this.key("signatureAlgorithm").use(a),this.key("signatureValue").bitstr())});t.exports=p},function(t){t.exports={"2.16.840.1.101.3.4.1.1":"aes-128-ecb","2.16.840.1.101.3.4.1.2":"aes-128-cbc","2.16.840.1.101.3.4.1.3":"aes-128-ofb","2.16.840.1.101.3.4.1.4":"aes-128-cfb","2.16.840.1.101.3.4.1.21":"aes-192-ecb","2.16.840.1.101.3.4.1.22":"aes-192-cbc","2.16.840.1.101.3.4.1.23":"aes-192-ofb","2.16.840.1.101.3.4.1.24":"aes-192-cfb","2.16.840.1.101.3.4.1.41":"aes-256-ecb","2.16.840.1.101.3.4.1.42":"aes-256-cbc","2.16.840.1.101.3.4.1.43":"aes-256-ofb","2.16.840.1.101.3.4.1.44":"aes-256-cfb"}},function(t,e,r){(function(e){var n=/Proc-Type: 4,ENCRYPTED[\n\r]+DEK-Info: AES-((?:128)|(?:192)|(?:256))-CBC,([0-9A-H]+)[\n\r]+([0-9A-z\n\r\+\/\=]+)[\n\r]+/m,i=/^-----BEGIN ((?:.* KEY)|CERTIFICATE)-----/m,o=/^-----BEGIN ((?:.* KEY)|CERTIFICATE)-----([0-9A-z\n\r\+\/\=]+)-----END \1-----$/m,a=r(21),f=r(33);t.exports=function(t,r){var s,c=t.toString(),u=c.match(n);if(u){var h="aes"+u[1],d=new e(u[2],"hex"),l=new e(u[3].replace(/[\r\n]/g,""),"base64"),p=a(r,d.slice(0,8),parseInt(u[1],10)).key,b=[],y=f.createDecipheriv(h,p,d);b.push(y.update(l)),b.push(y.final()),s=e.concat(b)}else{var v=c.match(o);s=new e(v[2].replace(/[\r\n]/g,""),"base64")}return{tag:c.match(i)[1],data:s}}}).call(this,r(3).Buffer)},function(t,e,r){(function(e){var n=r(2),i=r(4).ec,o=r(23),a=r(68);function f(t,e){if(t.cmpn(0)<=0)throw new Error("invalid sig");if(t.cmp(e)>=e)throw new Error("invalid sig")}t.exports=function(t,r,s,c,u){var h=o(s);if("ec"===h.type){if("ecdsa"!==c&&"ecdsa/rsa"!==c)throw new Error("wrong public key type");return function(t,e,r){var n=a[r.data.algorithm.curve.join(".")];if(!n)throw new Error("unknown curve "+r.data.algorithm.curve.join("."));var o=new i(n),f=r.data.subjectPrivateKey.data;return o.verify(e,t,f)}(t,r,h)}if("dsa"===h.type){if("dsa"!==c)throw new Error("wrong public key type");return function(t,e,r){var i=r.data.p,a=r.data.q,s=r.data.g,c=r.data.pub_key,u=o.signature.decode(t,"der"),h=u.s,d=u.r;f(h,a),f(d,a);var l=n.mont(i),p=h.invm(a);return 0===s.toRed(l).redPow(new n(e).mul(p).mod(a)).fromRed().mul(c.toRed(l).redPow(d.mul(p).mod(a)).fromRed()).mod(i).mod(a).cmp(d)}(t,r,h)}if("rsa"!==c&&"ecdsa/rsa"!==c)throw new Error("wrong public key type");r=e.concat([u,r]);for(var d=h.modulus.byteLength(),l=[1],p=0;r.length+l.length+2<d;)l.push(255),p++;l.push(0);for(var b=-1;++b<r.length;)l.push(r[b]);l=new e(l);var y=n.mont(h.modulus);t=(t=new n(t).toRed(y)).redPow(new n(h.publicExponent)),t=new e(t.fromRed().toArray());var v=p<8?1:0;for(d=Math.min(t.length,l.length),t.length!==l.length&&(v=1),b=-1;++b<d;)v|=t[b]^l[b];return 0===v}}).call(this,r(3).Buffer)},function(t,e,r){(function(e){var n=r(4),i=r(2);t.exports=function(t){return new a(t)};var o={secp256k1:{name:"secp256k1",byteLength:32},secp224r1:{name:"p224",byteLength:28},prime256v1:{name:"p256",byteLength:32},prime192v1:{name:"p192",byteLength:24},ed25519:{name:"ed25519",byteLength:32},secp384r1:{name:"p384",byteLength:48},secp521r1:{name:"p521",byteLength:66}};function a(t){this.curveType=o[t],this.curveType||(this.curveType={name:t}),this.curve=new n.ec(this.curveType.name),this.keys=void 0}function f(t,r,n){Array.isArray(t)||(t=t.toArray());var i=new e(t);if(n&&i.length<n){var o=new e(n-i.length);o.fill(0),i=e.concat([o,i])}return r?i.toString(r):i}o.p224=o.secp224r1,o.p256=o.secp256r1=o.prime256v1,o.p192=o.secp192r1=o.prime192v1,o.p384=o.secp384r1,o.p521=o.secp521r1,a.prototype.generateKeys=function(t,e){return this.keys=this.curve.genKeyPair(),this.getPublicKey(t,e)},a.prototype.computeSecret=function(t,r,n){return r=r||"utf8",e.isBuffer(t)||(t=new e(t,r)),f(this.curve.keyFromPublic(t).getPublic().mul(this.keys.getPrivate()).getX(),n,this.curveType.byteLength)},a.prototype.getPublicKey=function(t,e){var r=this.keys.getPublic("compressed"===e,!0);return"hybrid"===e&&(r[r.length-1]%2?r[0]=7:r[0]=6),f(r,t)},a.prototype.getPrivateKey=function(t){return f(this.keys.getPrivate(),t)},a.prototype.setPublicKey=function(t,r){return r=r||"utf8",e.isBuffer(t)||(t=new e(t,r)),this.keys._importPublic(t),this},a.prototype.setPrivateKey=function(t,r){r=r||"utf8",e.isBuffer(t)||(t=new e(t,r));var n=new i(t);return n=n.toString(16),this.keys=this.curve.genKeyPair(),this.keys._importPrivate(n),this}}).call(this,r(3).Buffer)},function(t,e,r){e.publicEncrypt=r(159),e.privateDecrypt=r(160),e.privateEncrypt=function(t,r){return e.publicEncrypt(t,r,!0)},e.publicDecrypt=function(t,r){return e.privateDecrypt(t,r,!0)}},function(t,e,r){var n=r(23),i=r(11),o=r(13),a=r(69),f=r(70),s=r(2),c=r(71),u=r(35),h=r(1).Buffer;t.exports=function(t,e,r){var d;d=t.padding?t.padding:r?1:4;var l,p=n(t);if(4===d)l=function(t,e){var r=t.modulus.byteLength(),n=e.length,c=o("sha1").update(h.alloc(0)).digest(),u=c.length,d=2*u;if(n>r-d-2)throw new Error("message too long");var l=h.alloc(r-n-d-2),p=r-u-1,b=i(u),y=f(h.concat([c,l,h.alloc(1,1),e],p),a(b,p)),v=f(b,a(y,u));return new s(h.concat([h.alloc(1),v,y],r))}(p,e);else if(1===d)l=function(t,e,r){var n,o=e.length,a=t.modulus.byteLength();if(o>a-11)throw new Error("message too long");return n=r?h.alloc(a-o-3,255):function(t){for(var e,r=h.allocUnsafe(t),n=0,o=i(2*t),a=0;n<t;)a===o.length&&(o=i(2*t),a=0),(e=o[a++])&&(r[n++]=e);return r}(a-o-3),new s(h.concat([h.from([0,r?1:2]),n,h.alloc(1),e],a))}(p,e,r);else{if(3!==d)throw new Error("unknown padding");if((l=new s(e)).cmp(p.modulus)>=0)throw new Error("data too long for modulus")}return r?u(l,p):c(l,p)}},function(t,e,r){var n=r(23),i=r(69),o=r(70),a=r(2),f=r(35),s=r(13),c=r(71),u=r(1).Buffer;t.exports=function(t,e,r){var h;h=t.padding?t.padding:r?1:4;var d,l=n(t),p=l.modulus.byteLength();if(e.length>p||new a(e).cmp(l.modulus)>=0)throw new Error("decryption error");d=r?c(new a(e),l):f(e,l);var b=u.alloc(p-d.length);if(d=u.concat([b,d],p),4===h)return function(t,e){var r=t.modulus.byteLength(),n=s("sha1").update(u.alloc(0)).digest(),a=n.length;if(0!==e[0])throw new Error("decryption error");var f=e.slice(1,a+1),c=e.slice(a+1),h=o(f,i(c,a)),d=o(c,i(h,r-a-1));if(function(t,e){t=u.from(t),e=u.from(e);var r=0,n=t.length;t.length!==e.length&&(r++,n=Math.min(t.length,e.length));for(var i=-1;++i<n;)r+=t[i]^e[i];return r}(n,d.slice(0,a)))throw new Error("decryption error");for(var l=a;0===d[l];)l++;if(1!==d[l++])throw new Error("decryption error");return d.slice(l)}(l,d);if(1===h)return function(t,e,r){for(var n=e.slice(0,2),i=2,o=0;0!==e[i++];)if(i>=e.length){o++;break}var a=e.slice(2,i-1);if(("0002"!==n.toString("hex")&&!r||"0001"!==n.toString("hex")&&r)&&o++,a.length<8&&o++,o)throw new Error("decryption error");return e.slice(i)}(0,d,r);if(3===h)return d;throw new Error("unknown padding")}},function(t,e,r){"use strict";(function(t,n){function i(){throw new Error("secure random number generation not supported by this browser\nuse chrome, FireFox or Internet Explorer 11")}var o=r(1),a=r(11),f=o.Buffer,s=o.kMaxLength,c=t.crypto||t.msCrypto,u=Math.pow(2,32)-1;function h(t,e){if("number"!=typeof t||t!=t)throw new TypeError("offset must be a number");if(t>u||t<0)throw new TypeError("offset must be a uint32");if(t>s||t>e)throw new RangeError("offset out of range")}function d(t,e,r){if("number"!=typeof t||t!=t)throw new TypeError("size must be a number");if(t>u||t<0)throw new TypeError("size must be a uint32");if(t+e>r||t>s)throw new RangeError("buffer too small")}function l(t,e,r,i){if(n.browser){var o=t.buffer,f=new Uint8Array(o,e,r);return c.getRandomValues(f),i?void n.nextTick(function(){i(null,t)}):t}if(!i)return a(r).copy(t,e),t;a(r,function(r,n){if(r)return i(r);n.copy(t,e),i(null,t)})}c&&c.getRandomValues||!n.browser?(e.randomFill=function(e,r,n,i){if(!(f.isBuffer(e)||e instanceof t.Uint8Array))throw new TypeError('"buf" argument must be a Buffer or Uint8Array');if("function"==typeof r)i=r,r=0,n=e.length;else if("function"==typeof n)i=n,n=e.length-r;else if("function"!=typeof i)throw new TypeError('"cb" argument must be a function');return h(r,e.length),d(n,r,e.length),l(e,r,n,i)},e.randomFillSync=function(e,r,n){if(void 0===r&&(r=0),!(f.isBuffer(e)||e instanceof t.Uint8Array))throw new TypeError('"buf" argument must be a Buffer or Uint8Array');return h(r,e.length),void 0===n&&(n=e.length-r),d(n,r,e.length),l(e,r,n)}):(e.randomFill=i,e.randomFillSync=i)}).call(this,r(7),r(8))}])},function(t,e,r){t.exports=r(2)},function(t,e,r){"use strict";r.r(e);var n=r(0),i=r.n(n);function o(t,e,r,n,i,o,a){try{var f=t[o](a),s=f.value}catch(t){return void r(t)}f.done?e(s):Promise.resolve(s).then(n,i)}function a(t,e){return function(){var r=function(t){return function(){var e=this,r=arguments;return new Promise(function(n,i){var a=t.apply(e,r);function f(t){o(a,n,i,f,s,"next",t)}function s(t){o(a,n,i,f,s,"throw",t)}f(void 0)})}}(regeneratorRuntime.mark(function r(){var n,i,o,a=arguments;return regeneratorRuntime.wrap(function(r){for(;;)switch(r.prev=r.next){case 0:for(n=a.length,i=new Array(n),o=0;o<n;o++)i[o]=a[o];return r.abrupt("return",new Promise(function(r,n){t.apply(e,i.concat([function(t,e){null===t?r(e):n(t)}]))}));case 2:case"end":return r.stop()}},r,this)}));return function(){return r.apply(this,arguments)}}()}function f(t,e,r,n,i,o,a){try{var f=t[o](a),s=f.value}catch(t){return void r(t)}f.done?e(s):Promise.resolve(s).then(n,i)}function s(t){return function(){var e=this,r=arguments;return new Promise(function(n,i){var o=t.apply(e,r);function a(t){f(o,n,i,a,s,"next",t)}function s(t){f(o,n,i,a,s,"throw",t)}a(void 0)})}}function c(t,e,r){return e in t?Object.defineProperty(t,e,{value:r,enumerable:!0,configurable:!0,writable:!0}):t[e]=r,t}function u(t,e){for(var r=0;r<e.length;r++){var n=e[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}var h=function(){function t(){!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t)}return function(t,e,r){e&&u(t.prototype,e)}(t,[{key:"_createFinalPayload",value:function(e){return function(t){for(var e=1;e<arguments.length;e++){var r=null!=arguments[e]?arguments[e]:{},n=Object.keys(r);"function"==typeof Object.getOwnPropertySymbols&&(n=n.concat(Object.getOwnPropertySymbols(r).filter(function(t){return Object.getOwnPropertyDescriptor(r,t).enumerable}))),n.forEach(function(e){c(t,e,r[e])})}return t}({id:t._getRandomId(),jsonrpc:"2.0",params:[]},e)}},{key:"_getRandomId",value:function(){return(new Date).getTime()*Math.pow(10,3)+Math.floor(Math.random()*Math.pow(10,3))}},{key:"handleRequest",value:function(){var t=s(regeneratorRuntime.mark(function t(){return regeneratorRuntime.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return t.abrupt("return");case 1:case"end":return t.stop()}},t,this)}));return function(){return t.apply(this,arguments)}}()},{key:"emitPayloadAsync",value:function(){var e=s(regeneratorRuntime.mark(function e(r){var n,i;return regeneratorRuntime.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return n=t._createFinalPayload(r),e.next=3,a(this.engine.sendAsync,this.engine)(n);case 3:return i=e.sent,e.abrupt("return",i);case 5:case"end":return e.stop()}},e,this)}));return function(t){return e.apply(this,arguments)}}()},{key:"setEngine",value:function(t){this.engine=t}}]),t}();function d(t){return(d="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}function l(t,e,r){return e in t?Object.defineProperty(t,e,{value:r,enumerable:!0,configurable:!0,writable:!0}):t[e]=r,t}function p(t,e,r,n,i,o,a){try{var f=t[o](a),s=f.value}catch(t){return void r(t)}f.done?e(s):Promise.resolve(s).then(n,i)}function b(t){return function(){var e=this,r=arguments;return new Promise(function(n,i){var o=t.apply(e,r);function a(t){p(o,n,i,a,f,"next",t)}function f(t){p(o,n,i,a,f,"throw",t)}a(void 0)})}}function y(t,e){for(var r=0;r<e.length;r++){var n=e[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}function v(t){return(v=Object.setPrototypeOf?Object.getPrototypeOf:function(t){return t.__proto__||Object.getPrototypeOf(t)})(t)}function g(t,e){return(g=Object.setPrototypeOf||function(t,e){return t.__proto__=e,t})(t,e)}r.d(e,"default",function(){return m});var m=function(t){function e(t){var r;return function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,e),(r=function(t,e){return!e||"object"!==d(e)&&"function"!=typeof e?function(t){if(void 0===t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return t}(t):e}(this,v(e).call(this)))._walletconnect=new i.a(t),r}return function(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function");t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,writable:!0,configurable:!0}}),e&&g(t,e)}(e,h),function(t,e,r){e&&y(t.prototype,e)}(e,[{key:"initSession",value:function(){var t=b(regeneratorRuntime.mark(function t(){var e;return regeneratorRuntime.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,this._walletconnect.initSession();case 2:return e=t.sent,t.abrupt("return",e);case 4:case"end":return t.stop()}},t,this)}));return function(){return t.apply(this,arguments)}}()},{key:"listenSessionStatus",value:function(){var t=b(regeneratorRuntime.mark(function t(){var e;return regeneratorRuntime.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,this._walletconnect.listenSessionStatus();case 2:return e=t.sent,t.abrupt("return",e);case 4:case"end":return t.stop()}},t,this)}));return function(){return t.apply(this,arguments)}}()},{key:"stopLastListener",value:function(){return this._walletconnect.stopLastListener()}},{key:"setEngine",value:function(t){this.engine=t,this.engine.walletconnect=this,this.engine.isWalletConnect=this.isWalletConnect}},{key:"handleRequest",value:function(){var t=b(regeneratorRuntime.mark(function t(e,r,n){var i;return regeneratorRuntime.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:t.t0=e.method,t.next="eth_accounts"===t.t0?3:"eth_signTransaction"===t.t0?5:"eth_sendTransaction"===t.t0?5:"eth_sendRawTransaction"===t.t0?5:"eth_sign"===t.t0?5:"eth_signTypedData"===t.t0?5:"eth_signTypedData_v3"===t.t0?5:"personal_sign"===t.t0?5:16;break;case 3:return n(null,this.accounts),t.abrupt("return");case 5:return t.prev=5,t.next=8,this._walletconnect.createCallRequest(e);case 8:i=t.sent,n(null,i),t.next=15;break;case 12:t.prev=12,t.t1=t.catch(5),n(t.t1);case 15:return t.abrupt("return");case 16:return r(),t.abrupt("return");case 18:case"end":return t.stop()}},t,this,[[5,12]])}));return function(e,r,n){return t.apply(this,arguments)}}()},{key:"sendAsync",value:function(t,e){var r=this;this.handleRequest(t,function(){r.engine.sendAsync.bind(r)(t,e)},function(r,n){return r?e(r):e(null,function(t){for(var e=1;e<arguments.length;e++){var r=null!=arguments[e]?arguments[e]:{},n=Object.keys(r);"function"==typeof Object.getOwnPropertySymbols&&(n=n.concat(Object.getOwnPropertySymbols(r).filter(function(t){return Object.getOwnPropertyDescriptor(r,t).enumerable}))),n.forEach(function(e){l(t,e,r[e])})}return t}({},t,{result:n}))})}},{key:"isWalletConnect",set:function(t){},get:function(){return!0}},{key:"isConnected",set:function(t){},get:function(){return this._walletconnect.isConnected}},{key:"uri",set:function(t){},get:function(){return this._walletconnect.uri}},{key:"accounts",set:function(t){},get:function(){return this._walletconnect.accounts}}]),e}()}])},function(t,e,r){t.exports=r(63)},function(t,e,r){"use strict";r.r(e);var n=r(59),i=r.n(n),o=r(60),a=r.n(o),f=r(61),s=r.n(f);e.default=function(t){var e=t.bridgeUrl||null;if(!e||"string"!=typeof e)throw new Error("Missing or Invalid bridgeUrl field");var r=t.dappName||null;if(!r||"string"!=typeof r)throw new Error("Missing or Invalid dappName field");var n=t.rpcUrl||null;if(!n||"string"!=typeof n)throw new Error("Missing or Invalid rpcUrl field");var o=new i.a,f=new s.a(t),c=new a.a({rpcUrl:t.rpcUrl});return o.addProvider(f),o.addProvider(c),o.start(),o}},function(t,e){t.exports=function(t){return t&&"object"==typeof t&&"function"==typeof t.copy&&"function"==typeof t.fill&&"function"==typeof t.readUInt8}},function(t,e,r){"use strict";var n="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},i=r(66),o=r(84),a=r(45),f=r(122),s=r(3),c=r(37),u=r(1).Buffer;Object.assign(e,r(46)),e.MAX_INTEGER=new s("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",16),e.TWO_POW256=new s("10000000000000000000000000000000000000000000000000000000000000000",16),e.KECCAK256_NULL_S="c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",e.SHA3_NULL_S=e.KECCAK256_NULL_S,e.KECCAK256_NULL=u.from(e.KECCAK256_NULL_S,"hex"),e.SHA3_NULL=e.KECCAK256_NULL,e.KECCAK256_RLP_ARRAY_S="1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347",e.SHA3_RLP_ARRAY_S=e.KECCAK256_RLP_ARRAY_S,e.KECCAK256_RLP_ARRAY=u.from(e.KECCAK256_RLP_ARRAY_S,"hex"),e.SHA3_RLP_ARRAY=e.KECCAK256_RLP_ARRAY,e.KECCAK256_RLP_S="56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421",e.SHA3_RLP_S=e.KECCAK256_RLP_S,e.KECCAK256_RLP=u.from(e.KECCAK256_RLP_S,"hex"),e.SHA3_RLP=e.KECCAK256_RLP,e.BN=s,e.rlp=f,e.secp256k1=o,e.zeros=function(t){return u.allocUnsafe(t).fill(0)},e.zeroAddress=function(){var t=e.zeros(20);return e.bufferToHex(t)},e.setLengthLeft=e.setLength=function(t,r,n){var i=e.zeros(r);return t=e.toBuffer(t),n?t.length<r?(t.copy(i),i):t.slice(0,r):t.length<r?(t.copy(i,r-t.length),i):t.slice(-r)},e.setLengthRight=function(t,r){return e.setLength(t,r,!0)},e.unpad=e.stripZeros=function(t){for(var r=(t=e.stripHexPrefix(t))[0];t.length>0&&"0"===r.toString();)r=(t=t.slice(1))[0];return t},e.toBuffer=function(t){if(!u.isBuffer(t))if(Array.isArray(t))t=u.from(t);else if("string"==typeof t)t=e.isHexString(t)?u.from(e.padToEven(e.stripHexPrefix(t)),"hex"):u.from(t);else if("number"==typeof t)t=e.intToBuffer(t);else if(null===t||void 0===t)t=u.allocUnsafe(0);else if(s.isBN(t))t=t.toArrayLike(u);else{if(!t.toArray)throw new Error("invalid type");t=u.from(t.toArray())}return t},e.bufferToInt=function(t){return new s(e.toBuffer(t)).toNumber()},e.bufferToHex=function(t){return"0x"+(t=e.toBuffer(t)).toString("hex")},e.fromSigned=function(t){return new s(t).fromTwos(256)},e.toUnsigned=function(t){return u.from(t.toTwos(256).toArray())},e.keccak=function(t,r){return t=e.toBuffer(t),r||(r=256),i("keccak"+r).update(t).digest()},e.keccak256=function(t){return e.keccak(t)},e.sha3=e.keccak,e.sha256=function(t){return t=e.toBuffer(t),c("sha256").update(t).digest()},e.ripemd160=function(t,r){t=e.toBuffer(t);var n=c("rmd160").update(t).digest();return!0===r?e.setLength(n,32):n},e.rlphash=function(t){return e.keccak(f.encode(t))},e.isValidPrivate=function(t){return o.privateKeyVerify(t)},e.isValidPublic=function(t,e){return 64===t.length?o.publicKeyVerify(u.concat([u.from([4]),t])):!!e&&o.publicKeyVerify(t)},e.pubToAddress=e.publicToAddress=function(t,r){return t=e.toBuffer(t),r&&64!==t.length&&(t=o.publicKeyConvert(t,!1).slice(1)),a(64===t.length),e.keccak(t).slice(-20)};var h=e.privateToPublic=function(t){return t=e.toBuffer(t),o.publicKeyCreate(t,!1).slice(1)};e.importPublic=function(t){return 64!==(t=e.toBuffer(t)).length&&(t=o.publicKeyConvert(t,!1).slice(1)),t},e.ecsign=function(t,e){var r=o.sign(t,e),n={};return n.r=r.signature.slice(0,32),n.s=r.signature.slice(32,64),n.v=r.recovery+27,n},e.hashPersonalMessage=function(t){var r=e.toBuffer("Ethereum Signed Message:\n"+t.length.toString());return e.keccak(u.concat([r,t]))},e.ecrecover=function(t,r,n,i){var a=u.concat([e.setLength(n,32),e.setLength(i,32)],64),f=r-27;if(0!==f&&1!==f)throw new Error("Invalid signature v value");var s=o.recover(t,a,f);return o.publicKeyConvert(s,!1).slice(1)},e.toRpcSig=function(t,r,n){if(27!==t&&28!==t)throw new Error("Invalid recovery id");return e.bufferToHex(u.concat([e.setLengthLeft(r,32),e.setLengthLeft(n,32),e.toBuffer(t-27)]))},e.fromRpcSig=function(t){if(65!==(t=e.toBuffer(t)).length)throw new Error("Invalid signature length");var r=t[64];return r<27&&(r+=27),{v:r,r:t.slice(0,32),s:t.slice(32,64)}},e.privateToAddress=function(t){return e.publicToAddress(h(t))},e.isValidAddress=function(t){return/^0x[0-9a-fA-F]{40}$/.test(t)},e.isZeroAddress=function(t){return e.zeroAddress()===e.addHexPrefix(t)},e.toChecksumAddress=function(t){t=e.stripHexPrefix(t).toLowerCase();for(var r=e.keccak(t).toString("hex"),n="0x",i=0;i<t.length;i++)parseInt(r[i],16)>=8?n+=t[i].toUpperCase():n+=t[i];return n},e.isValidChecksumAddress=function(t){return e.isValidAddress(t)&&e.toChecksumAddress(t)===t},e.generateAddress=function(t,r){return t=e.toBuffer(t),r=(r=new s(r)).isZero()?null:u.from(r.toArray()),e.rlphash([t,r]).slice(-20)},e.isPrecompiled=function(t){var r=e.unpad(t);return 1===r.length&&r[0]>=1&&r[0]<=8},e.addHexPrefix=function(t){return"string"!=typeof t?t:e.isHexPrefixed(t)?t:"0x"+t},e.isValidSignature=function(t,e,r,n){var i=new s("7fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a0",16),o=new s("fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141",16);return 32===e.length&&32===r.length&&((27===t||28===t)&&(e=new s(e),r=new s(r),!(e.isZero()||e.gt(o)||r.isZero()||r.gt(o))&&(!1!==n||1!==new s(r).cmp(i))))},e.baToJSON=function(t){if(u.isBuffer(t))return"0x"+t.toString("hex");if(t instanceof Array){for(var r=[],n=0;n<t.length;n++)r.push(e.baToJSON(t[n]));return r}},e.defineProperties=function(t,r,i){if(t.raw=[],t._fields=[],t.toJSON=function(r){if(r){var n={};return t._fields.forEach(function(e){n[e]="0x"+t[e].toString("hex")}),n}return e.baToJSON(this.raw)},t.serialize=function(){return f.encode(t.raw)},r.forEach(function(r,n){function i(){return t.raw[n]}function o(i){"00"!==(i=e.toBuffer(i)).toString("hex")||r.allowZero||(i=u.allocUnsafe(0)),r.allowLess&&r.length?(i=e.stripZeros(i),a(r.length>=i.length,"The field "+r.name+" must not have more "+r.length+" bytes")):r.allowZero&&0===i.length||!r.length||a(r.length===i.length,"The field "+r.name+" must have byte length of "+r.length),t.raw[n]=i}t._fields.push(r.name),Object.defineProperty(t,r.name,{enumerable:!0,configurable:!0,get:i,set:o}),r.default&&(t[r.name]=r.default),r.alias&&Object.defineProperty(t,r.alias,{enumerable:!1,configurable:!0,set:o,get:i})}),i)if("string"==typeof i&&(i=u.from(e.stripHexPrefix(i),"hex")),u.isBuffer(i)&&(i=f.decode(i)),Array.isArray(i)){if(i.length>t._fields.length)throw new Error("wrong number of fields in data");i.forEach(function(r,n){t[t._fields[n]]=e.toBuffer(r)})}else{if("object"!==(void 0===i?"undefined":n(i)))throw new Error("invalid data");var o=Object.keys(i);r.forEach(function(e){-1!==o.indexOf(e.name)&&(t[e.name]=i[e.name]),-1!==o.indexOf(e.alias)&&(t[e.alias]=i[e.alias])})}}},function(t,e,r){"use strict";t.exports=r(67)(r(82))},function(t,e,r){"use strict";var n=r(68),i=r(81);t.exports=function(t){var e=n(t),r=i(t);return function(t,n){switch("string"==typeof t?t.toLowerCase():t){case"keccak224":return new e(1152,448,null,224,n);case"keccak256":return new e(1088,512,null,256,n);case"keccak384":return new e(832,768,null,384,n);case"keccak512":return new e(576,1024,null,512,n);case"sha3-224":return new e(1152,448,6,224,n);case"sha3-256":return new e(1088,512,6,256,n);case"sha3-384":return new e(832,768,6,384,n);case"sha3-512":return new e(576,1024,6,512,n);case"shake128":return new r(1344,256,31,n);case"shake256":return new r(1088,512,31,n);default:throw new Error("Invald algorithm: "+t)}}}},function(t,e,r){"use strict";var n=r(1).Buffer,i=r(16).Transform,o=r(0);t.exports=function(t){function e(e,r,n,o,a){i.call(this,a),this._rate=e,this._capacity=r,this._delimitedSuffix=n,this._hashBitLength=o,this._options=a,this._state=new t,this._state.initialize(e,r),this._finalized=!1}return o(e,i),e.prototype._transform=function(t,e,r){var n=null;try{this.update(t,e)}catch(t){n=t}r(n)},e.prototype._flush=function(t){var e=null;try{this.push(this.digest())}catch(t){e=t}t(e)},e.prototype.update=function(t,e){if(!n.isBuffer(t)&&"string"!=typeof t)throw new TypeError("Data must be a string or a buffer");if(this._finalized)throw new Error("Digest already called");return n.isBuffer(t)||(t=n.from(t,e)),this._state.absorb(t),this},e.prototype.digest=function(t){if(this._finalized)throw new Error("Digest already called");this._finalized=!0,this._delimitedSuffix&&this._state.absorbLastFewBits(this._delimitedSuffix);var e=this._state.squeeze(this._hashBitLength/8);return void 0!==t&&(e=e.toString(t)),this._resetState(),e},e.prototype._resetState=function(){return this._state.initialize(this._rate,this._capacity),this},e.prototype._clone=function(){var t=new e(this._rate,this._capacity,this._delimitedSuffix,this._hashBitLength,this._options);return this._state.copy(t._state),t._finalized=this._finalized,t},e}},function(t,e,r){"use strict";e.byteLength=function(t){var e=c(t),r=e[0],n=e[1];return 3*(r+n)/4-n},e.toByteArray=function(t){for(var e,r=c(t),n=r[0],a=r[1],f=new o(function(t,e,r){return 3*(e+r)/4-r}(0,n,a)),s=0,u=a>0?n-4:n,h=0;h<u;h+=4)e=i[t.charCodeAt(h)]<<18|i[t.charCodeAt(h+1)]<<12|i[t.charCodeAt(h+2)]<<6|i[t.charCodeAt(h+3)],f[s++]=e>>16&255,f[s++]=e>>8&255,f[s++]=255&e;2===a&&(e=i[t.charCodeAt(h)]<<2|i[t.charCodeAt(h+1)]>>4,f[s++]=255&e);1===a&&(e=i[t.charCodeAt(h)]<<10|i[t.charCodeAt(h+1)]<<4|i[t.charCodeAt(h+2)]>>2,f[s++]=e>>8&255,f[s++]=255&e);return f},e.fromByteArray=function(t){for(var e,r=t.length,i=r%3,o=[],a=0,f=r-i;a<f;a+=16383)o.push(h(t,a,a+16383>f?f:a+16383));1===i?(e=t[r-1],o.push(n[e>>2]+n[e<<4&63]+"==")):2===i&&(e=(t[r-2]<<8)+t[r-1],o.push(n[e>>10]+n[e>>4&63]+n[e<<2&63]+"="));return o.join("")};for(var n=[],i=[],o="undefined"!=typeof Uint8Array?Uint8Array:Array,a="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",f=0,s=a.length;f<s;++f)n[f]=a[f],i[a.charCodeAt(f)]=f;function c(t){var e=t.length;if(e%4>0)throw new Error("Invalid string. Length must be a multiple of 4");var r=t.indexOf("=");return-1===r&&(r=e),[r,r===e?0:4-r%4]}function u(t){return n[t>>18&63]+n[t>>12&63]+n[t>>6&63]+n[63&t]}function h(t,e,r){for(var n,i=[],o=e;o<r;o+=3)n=(t[o]<<16&16711680)+(t[o+1]<<8&65280)+(255&t[o+2]),i.push(u(n));return i.join("")}i["-".charCodeAt(0)]=62,i["_".charCodeAt(0)]=63},function(t,e){e.read=function(t,e,r,n,i){var o,a,f=8*i-n-1,s=(1<<f)-1,c=s>>1,u=-7,h=r?i-1:0,d=r?-1:1,l=t[e+h];for(h+=d,o=l&(1<<-u)-1,l>>=-u,u+=f;u>0;o=256*o+t[e+h],h+=d,u-=8);for(a=o&(1<<-u)-1,o>>=-u,u+=n;u>0;a=256*a+t[e+h],h+=d,u-=8);if(0===o)o=1-c;else{if(o===s)return a?NaN:1/0*(l?-1:1);a+=Math.pow(2,n),o-=c}return(l?-1:1)*a*Math.pow(2,o-n)},e.write=function(t,e,r,n,i,o){var a,f,s,c=8*o-i-1,u=(1<<c)-1,h=u>>1,d=23===i?Math.pow(2,-24)-Math.pow(2,-77):0,l=n?0:o-1,p=n?1:-1,b=e<0||0===e&&1/e<0?1:0;for(e=Math.abs(e),isNaN(e)||e===1/0?(f=isNaN(e)?1:0,a=u):(a=Math.floor(Math.log(e)/Math.LN2),e*(s=Math.pow(2,-a))<1&&(a--,s*=2),(e+=a+h>=1?d/s:d*Math.pow(2,1-h))*s>=2&&(a++,s/=2),a+h>=u?(f=0,a=u):a+h>=1?(f=(e*s-1)*Math.pow(2,i),a+=h):(f=e*Math.pow(2,h-1)*Math.pow(2,i),a=0));i>=8;t[r+l]=255&f,l+=p,f/=256,i-=8);for(a=a<<i|f,c+=i;c>0;t[r+l]=255&a,l+=p,a/=256,c-=8);t[r+l-p]|=128*b}},function(t,e){},function(t,e,r){"use strict";var n=r(1).Buffer,i=r(73);function o(t,e,r){t.copy(e,r)}t.exports=function(){function t(){!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),this.head=null,this.tail=null,this.length=0}return t.prototype.push=function(t){var e={data:t,next:null};this.length>0?this.tail.next=e:this.head=e,this.tail=e,++this.length},t.prototype.unshift=function(t){var e={data:t,next:this.head};0===this.length&&(this.tail=e),this.head=e,++this.length},t.prototype.shift=function(){if(0!==this.length){var t=this.head.data;return 1===this.length?this.head=this.tail=null:this.head=this.head.next,--this.length,t}},t.prototype.clear=function(){this.head=this.tail=null,this.length=0},t.prototype.join=function(t){if(0===this.length)return"";for(var e=this.head,r=""+e.data;e=e.next;)r+=t+e.data;return r},t.prototype.concat=function(t){if(0===this.length)return n.alloc(0);if(1===this.length)return this.head.data;for(var e=n.allocUnsafe(t>>>0),r=this.head,i=0;r;)o(r.data,e,i),i+=r.data.length,r=r.next;return e},t}(),i&&i.inspect&&i.inspect.custom&&(t.exports.prototype[i.inspect.custom]=function(){var t=i.inspect({length:this.length});return this.constructor.name+" "+t})},function(t,e){},function(t,e,r){(function(t,e){!function(t,r){"use strict";if(!t.setImmediate){var n,i=1,o={},a=!1,f=t.document,s=Object.getPrototypeOf&&Object.getPrototypeOf(t);s=s&&s.setTimeout?s:t,"[object process]"==={}.toString.call(t.process)?n=function(t){e.nextTick(function(){u(t)})}:function(){if(t.postMessage&&!t.importScripts){var e=!0,r=t.onmessage;return t.onmessage=function(){e=!1},t.postMessage("","*"),t.onmessage=r,e}}()?function(){var e="setImmediate$"+Math.random()+"$",r=function(r){r.source===t&&"string"==typeof r.data&&0===r.data.indexOf(e)&&u(+r.data.slice(e.length))};t.addEventListener?t.addEventListener("message",r,!1):t.attachEvent("onmessage",r),n=function(r){t.postMessage(e+r,"*")}}():t.MessageChannel?function(){var t=new MessageChannel;t.port1.onmessage=function(t){u(t.data)},n=function(e){t.port2.postMessage(e)}}():f&&"onreadystatechange"in f.createElement("script")?function(){var t=f.documentElement;n=function(e){var r=f.createElement("script");r.onreadystatechange=function(){u(e),r.onreadystatechange=null,t.removeChild(r),r=null},t.appendChild(r)}}():n=function(t){setTimeout(u,0,t)},s.setImmediate=function(t){"function"!=typeof t&&(t=new Function(""+t));for(var e=new Array(arguments.length-1),r=0;r<e.length;r++)e[r]=arguments[r+1];var a={callback:t,args:e};return o[i]=a,n(i),i++},s.clearImmediate=c}function c(t){delete o[t]}function u(t){if(a)setTimeout(u,0,t);else{var e=o[t];if(e){a=!0;try{!function(t){var e=t.callback,n=t.args;switch(n.length){case 0:e();break;case 1:e(n[0]);break;case 2:e(n[0],n[1]);break;case 3:e(n[0],n[1],n[2]);break;default:e.apply(r,n)}}(e)}finally{c(t),a=!1}}}}}("undefined"==typeof self?void 0===t?this:t:self)}).call(this,r(4),r(6))},function(t,e,r){(function(e){function r(t){try{if(!e.localStorage)return!1}catch(t){return!1}var r=e.localStorage[t];return null!=r&&"true"===String(r).toLowerCase()}t.exports=function(t,e){if(r("noDeprecation"))return t;var n=!1;return function(){if(!n){if(r("throwDeprecation"))throw new Error(e);r("traceDeprecation")?console.trace(e):console.warn(e),n=!0}return t.apply(this,arguments)}}}).call(this,r(4))},function(t,e,r){"use strict";t.exports=o;var n=r(35),i=r(12);function o(t){if(!(this instanceof o))return new o(t);n.call(this,t)}i.inherits=r(0),i.inherits(o,n),o.prototype._transform=function(t,e,r){r(null,t)}},function(t,e,r){t.exports=r(20)},function(t,e,r){t.exports=r(7)},function(t,e,r){t.exports=r(19).Transform},function(t,e,r){t.exports=r(19).PassThrough},function(t,e,r){"use strict";var n=r(1).Buffer,i=r(16).Transform,o=r(0);t.exports=function(t){function e(e,r,n,o){i.call(this,o),this._rate=e,this._capacity=r,this._delimitedSuffix=n,this._options=o,this._state=new t,this._state.initialize(e,r),this._finalized=!1}return o(e,i),e.prototype._transform=function(t,e,r){var n=null;try{this.update(t,e)}catch(t){n=t}r(n)},e.prototype._flush=function(){},e.prototype._read=function(t){this.push(this.squeeze(t))},e.prototype.update=function(t,e){if(!n.isBuffer(t)&&"string"!=typeof t)throw new TypeError("Data must be a string or a buffer");if(this._finalized)throw new Error("Squeeze already called");return n.isBuffer(t)||(t=n.from(t,e)),this._state.absorb(t),this},e.prototype.squeeze=function(t,e){this._finalized||(this._finalized=!0,this._state.absorbLastFewBits(this._delimitedSuffix));var r=this._state.squeeze(t);return void 0!==e&&(r=r.toString(e)),r},e.prototype._resetState=function(){return this._state.initialize(this._rate,this._capacity),this},e.prototype._clone=function(){var t=new e(this._rate,this._capacity,this._delimitedSuffix,this._options);return this._state.copy(t._state),t._finalized=this._finalized,t},e}},function(t,e,r){"use strict";var n=r(1).Buffer,i=r(83);function o(){this.state=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],this.blockSize=null,this.count=0,this.squeezing=!1}o.prototype.initialize=function(t,e){for(var r=0;r<50;++r)this.state[r]=0;this.blockSize=t/8,this.count=0,this.squeezing=!1},o.prototype.absorb=function(t){for(var e=0;e<t.length;++e)this.state[~~(this.count/4)]^=t[e]<<this.count%4*8,this.count+=1,this.count===this.blockSize&&(i.p1600(this.state),this.count=0)},o.prototype.absorbLastFewBits=function(t){this.state[~~(this.count/4)]^=t<<this.count%4*8,0!=(128&t)&&this.count===this.blockSize-1&&i.p1600(this.state),this.state[~~((this.blockSize-1)/4)]^=128<<(this.blockSize-1)%4*8,i.p1600(this.state),this.count=0,this.squeezing=!0},o.prototype.squeeze=function(t){this.squeezing||this.absorbLastFewBits(1);for(var e=n.alloc(t),r=0;r<t;++r)e[r]=this.state[~~(this.count/4)]>>>this.count%4*8&255,this.count+=1,this.count===this.blockSize&&(i.p1600(this.state),this.count=0);return e},o.prototype.copy=function(t){for(var e=0;e<50;++e)t.state[e]=this.state[e];t.blockSize=this.blockSize,t.count=this.count,t.squeezing=this.squeezing},t.exports=o},function(t,e,r){"use strict";var n=[1,0,32898,0,32906,2147483648,2147516416,2147483648,32907,0,2147483649,0,2147516545,2147483648,32777,2147483648,138,0,136,0,2147516425,0,2147483658,0,2147516555,0,139,2147483648,32905,2147483648,32771,2147483648,32770,2147483648,128,2147483648,32778,0,2147483658,2147483648,2147516545,2147483648,32896,2147483648,2147483649,0,2147516424,2147483648];e.p1600=function(t){for(var e=0;e<24;++e){var r=t[0]^t[10]^t[20]^t[30]^t[40],i=t[1]^t[11]^t[21]^t[31]^t[41],o=t[2]^t[12]^t[22]^t[32]^t[42],a=t[3]^t[13]^t[23]^t[33]^t[43],f=t[4]^t[14]^t[24]^t[34]^t[44],s=t[5]^t[15]^t[25]^t[35]^t[45],c=t[6]^t[16]^t[26]^t[36]^t[46],u=t[7]^t[17]^t[27]^t[37]^t[47],h=t[8]^t[18]^t[28]^t[38]^t[48],d=t[9]^t[19]^t[29]^t[39]^t[49],l=h^(o<<1|a>>>31),p=d^(a<<1|o>>>31),b=t[0]^l,y=t[1]^p,v=t[10]^l,g=t[11]^p,m=t[20]^l,_=t[21]^p,w=t[30]^l,S=t[31]^p,E=t[40]^l,M=t[41]^p;l=r^(f<<1|s>>>31),p=i^(s<<1|f>>>31);var A=t[2]^l,x=t[3]^p,k=t[12]^l,I=t[13]^p,B=t[22]^l,R=t[23]^p,P=t[32]^l,T=t[33]^p,L=t[42]^l,O=t[43]^p;l=o^(c<<1|u>>>31),p=a^(u<<1|c>>>31);var C=t[4]^l,j=t[5]^p,N=t[14]^l,D=t[15]^p,U=t[24]^l,q=t[25]^p,z=t[34]^l,F=t[35]^p,K=t[44]^l,Y=t[45]^p;l=f^(h<<1|d>>>31),p=s^(d<<1|h>>>31);var V=t[6]^l,H=t[7]^p,W=t[16]^l,G=t[17]^p,X=t[26]^l,J=t[27]^p,Z=t[36]^l,$=t[37]^p,Q=t[46]^l,tt=t[47]^p;l=c^(r<<1|i>>>31),p=u^(i<<1|r>>>31);var et=t[8]^l,rt=t[9]^p,nt=t[18]^l,it=t[19]^p,ot=t[28]^l,at=t[29]^p,ft=t[38]^l,st=t[39]^p,ct=t[48]^l,ut=t[49]^p,ht=b,dt=y,lt=g<<4|v>>>28,pt=v<<4|g>>>28,bt=m<<3|_>>>29,yt=_<<3|m>>>29,vt=S<<9|w>>>23,gt=w<<9|S>>>23,mt=E<<18|M>>>14,_t=M<<18|E>>>14,wt=A<<1|x>>>31,St=x<<1|A>>>31,Et=I<<12|k>>>20,Mt=k<<12|I>>>20,At=B<<10|R>>>22,xt=R<<10|B>>>22,kt=T<<13|P>>>19,It=P<<13|T>>>19,Bt=L<<2|O>>>30,Rt=O<<2|L>>>30,Pt=j<<30|C>>>2,Tt=C<<30|j>>>2,Lt=N<<6|D>>>26,Ot=D<<6|N>>>26,Ct=q<<11|U>>>21,jt=U<<11|q>>>21,Nt=z<<15|F>>>17,Dt=F<<15|z>>>17,Ut=Y<<29|K>>>3,qt=K<<29|Y>>>3,zt=V<<28|H>>>4,Ft=H<<28|V>>>4,Kt=G<<23|W>>>9,Yt=W<<23|G>>>9,Vt=X<<25|J>>>7,Ht=J<<25|X>>>7,Wt=Z<<21|$>>>11,Gt=$<<21|Z>>>11,Xt=tt<<24|Q>>>8,Jt=Q<<24|tt>>>8,Zt=et<<27|rt>>>5,$t=rt<<27|et>>>5,Qt=nt<<20|it>>>12,te=it<<20|nt>>>12,ee=at<<7|ot>>>25,re=ot<<7|at>>>25,ne=ft<<8|st>>>24,ie=st<<8|ft>>>24,oe=ct<<14|ut>>>18,ae=ut<<14|ct>>>18;t[0]=ht^~Et&Ct,t[1]=dt^~Mt&jt,t[10]=zt^~Qt&bt,t[11]=Ft^~te&yt,t[20]=wt^~Lt&Vt,t[21]=St^~Ot&Ht,t[30]=Zt^~lt&At,t[31]=$t^~pt&xt,t[40]=Pt^~Kt&ee,t[41]=Tt^~Yt&re,t[2]=Et^~Ct&Wt,t[3]=Mt^~jt&Gt,t[12]=Qt^~bt&kt,t[13]=te^~yt&It,t[22]=Lt^~Vt&ne,t[23]=Ot^~Ht&ie,t[32]=lt^~At&Nt,t[33]=pt^~xt&Dt,t[42]=Kt^~ee&vt,t[43]=Yt^~re&gt,t[4]=Ct^~Wt&oe,t[5]=jt^~Gt&ae,t[14]=bt^~kt&Ut,t[15]=yt^~It&qt,t[24]=Vt^~ne&mt,t[25]=Ht^~ie&_t,t[34]=At^~Nt&Xt,t[35]=xt^~Dt&Jt,t[44]=ee^~vt&Bt,t[45]=re^~gt&Rt,t[6]=Wt^~oe&ht,t[7]=Gt^~ae&dt,t[16]=kt^~Ut&zt,t[17]=It^~qt&Ft,t[26]=ne^~mt&wt,t[27]=ie^~_t&St,t[36]=Nt^~Xt&Zt,t[37]=Dt^~Jt&$t,t[46]=vt^~Bt&Pt,t[47]=gt^~Rt&Tt,t[8]=oe^~ht&Et,t[9]=ae^~dt&Mt,t[18]=Ut^~zt&Qt,t[19]=qt^~Ft&te,t[28]=mt^~wt&Lt,t[29]=_t^~St&Ot,t[38]=Xt^~Zt&lt,t[39]=Jt^~$t&pt,t[48]=Bt^~Pt&Kt,t[49]=Rt^~Tt&Yt,t[0]^=n[2*e],t[1]^=n[2*e+1]}}},function(t,e,r){"use strict";t.exports=r(85)(r(89))},function(t,e,r){"use strict";var n=r(86),i=r(87),o=r(36);function a(t,e){return void 0===t?e:(n.isBoolean(t,o.COMPRESSED_TYPE_INVALID),t)}t.exports=function(t){return{privateKeyVerify:function(e){return n.isBuffer(e,o.EC_PRIVATE_KEY_TYPE_INVALID),32===e.length&&t.privateKeyVerify(e)},privateKeyExport:function(e,r){n.isBuffer(e,o.EC_PRIVATE_KEY_TYPE_INVALID),n.isBufferLength(e,32,o.EC_PRIVATE_KEY_LENGTH_INVALID),r=a(r,!0);var f=t.privateKeyExport(e,r);return i.privateKeyExport(e,f,r)},privateKeyImport:function(e){if(n.isBuffer(e,o.EC_PRIVATE_KEY_TYPE_INVALID),(e=i.privateKeyImport(e))&&32===e.length&&t.privateKeyVerify(e))return e;throw new Error(o.EC_PRIVATE_KEY_IMPORT_DER_FAIL)},privateKeyNegate:function(e){return n.isBuffer(e,o.EC_PRIVATE_KEY_TYPE_INVALID),n.isBufferLength(e,32,o.EC_PRIVATE_KEY_LENGTH_INVALID),t.privateKeyNegate(e)},privateKeyModInverse:function(e){return n.isBuffer(e,o.EC_PRIVATE_KEY_TYPE_INVALID),n.isBufferLength(e,32,o.EC_PRIVATE_KEY_LENGTH_INVALID),t.privateKeyModInverse(e)},privateKeyTweakAdd:function(e,r){return n.isBuffer(e,o.EC_PRIVATE_KEY_TYPE_INVALID),n.isBufferLength(e,32,o.EC_PRIVATE_KEY_LENGTH_INVALID),n.isBuffer(r,o.TWEAK_TYPE_INVALID),n.isBufferLength(r,32,o.TWEAK_LENGTH_INVALID),t.privateKeyTweakAdd(e,r)},privateKeyTweakMul:function(e,r){return n.isBuffer(e,o.EC_PRIVATE_KEY_TYPE_INVALID),n.isBufferLength(e,32,o.EC_PRIVATE_KEY_LENGTH_INVALID),n.isBuffer(r,o.TWEAK_TYPE_INVALID),n.isBufferLength(r,32,o.TWEAK_LENGTH_INVALID),t.privateKeyTweakMul(e,r)},publicKeyCreate:function(e,r){return n.isBuffer(e,o.EC_PRIVATE_KEY_TYPE_INVALID),n.isBufferLength(e,32,o.EC_PRIVATE_KEY_LENGTH_INVALID),r=a(r,!0),t.publicKeyCreate(e,r)},publicKeyConvert:function(e,r){return n.isBuffer(e,o.EC_PUBLIC_KEY_TYPE_INVALID),n.isBufferLength2(e,33,65,o.EC_PUBLIC_KEY_LENGTH_INVALID),r=a(r,!0),t.publicKeyConvert(e,r)},publicKeyVerify:function(e){return n.isBuffer(e,o.EC_PUBLIC_KEY_TYPE_INVALID),t.publicKeyVerify(e)},publicKeyTweakAdd:function(e,r,i){return n.isBuffer(e,o.EC_PUBLIC_KEY_TYPE_INVALID),n.isBufferLength2(e,33,65,o.EC_PUBLIC_KEY_LENGTH_INVALID),n.isBuffer(r,o.TWEAK_TYPE_INVALID),n.isBufferLength(r,32,o.TWEAK_LENGTH_INVALID),i=a(i,!0),t.publicKeyTweakAdd(e,r,i)},publicKeyTweakMul:function(e,r,i){return n.isBuffer(e,o.EC_PUBLIC_KEY_TYPE_INVALID),n.isBufferLength2(e,33,65,o.EC_PUBLIC_KEY_LENGTH_INVALID),n.isBuffer(r,o.TWEAK_TYPE_INVALID),n.isBufferLength(r,32,o.TWEAK_LENGTH_INVALID),i=a(i,!0),t.publicKeyTweakMul(e,r,i)},publicKeyCombine:function(e,r){n.isArray(e,o.EC_PUBLIC_KEYS_TYPE_INVALID),n.isLengthGTZero(e,o.EC_PUBLIC_KEYS_LENGTH_INVALID);for(var i=0;i<e.length;++i)n.isBuffer(e[i],o.EC_PUBLIC_KEY_TYPE_INVALID),n.isBufferLength2(e[i],33,65,o.EC_PUBLIC_KEY_LENGTH_INVALID);return r=a(r,!0),t.publicKeyCombine(e,r)},signatureNormalize:function(e){return n.isBuffer(e,o.ECDSA_SIGNATURE_TYPE_INVALID),n.isBufferLength(e,64,o.ECDSA_SIGNATURE_LENGTH_INVALID),t.signatureNormalize(e)},signatureExport:function(e){n.isBuffer(e,o.ECDSA_SIGNATURE_TYPE_INVALID),n.isBufferLength(e,64,o.ECDSA_SIGNATURE_LENGTH_INVALID);var r=t.signatureExport(e);return i.signatureExport(r)},signatureImport:function(e){n.isBuffer(e,o.ECDSA_SIGNATURE_TYPE_INVALID),n.isLengthGTZero(e,o.ECDSA_SIGNATURE_LENGTH_INVALID);var r=i.signatureImport(e);if(r)return t.signatureImport(r);throw new Error(o.ECDSA_SIGNATURE_PARSE_DER_FAIL)},signatureImportLax:function(e){n.isBuffer(e,o.ECDSA_SIGNATURE_TYPE_INVALID),n.isLengthGTZero(e,o.ECDSA_SIGNATURE_LENGTH_INVALID);var r=i.signatureImportLax(e);if(r)return t.signatureImport(r);throw new Error(o.ECDSA_SIGNATURE_PARSE_DER_FAIL)},sign:function(e,r,i){n.isBuffer(e,o.MSG32_TYPE_INVALID),n.isBufferLength(e,32,o.MSG32_LENGTH_INVALID),n.isBuffer(r,o.EC_PRIVATE_KEY_TYPE_INVALID),n.isBufferLength(r,32,o.EC_PRIVATE_KEY_LENGTH_INVALID);var a=null,f=null;return void 0!==i&&(n.isObject(i,o.OPTIONS_TYPE_INVALID),void 0!==i.data&&(n.isBuffer(i.data,o.OPTIONS_DATA_TYPE_INVALID),n.isBufferLength(i.data,32,o.OPTIONS_DATA_LENGTH_INVALID),a=i.data),void 0!==i.noncefn&&(n.isFunction(i.noncefn,o.OPTIONS_NONCEFN_TYPE_INVALID),f=i.noncefn)),t.sign(e,r,f,a)},verify:function(e,r,i){return n.isBuffer(e,o.MSG32_TYPE_INVALID),n.isBufferLength(e,32,o.MSG32_LENGTH_INVALID),n.isBuffer(r,o.ECDSA_SIGNATURE_TYPE_INVALID),n.isBufferLength(r,64,o.ECDSA_SIGNATURE_LENGTH_INVALID),n.isBuffer(i,o.EC_PUBLIC_KEY_TYPE_INVALID),n.isBufferLength2(i,33,65,o.EC_PUBLIC_KEY_LENGTH_INVALID),t.verify(e,r,i)},recover:function(e,r,i,f){return n.isBuffer(e,o.MSG32_TYPE_INVALID),n.isBufferLength(e,32,o.MSG32_LENGTH_INVALID),n.isBuffer(r,o.ECDSA_SIGNATURE_TYPE_INVALID),n.isBufferLength(r,64,o.ECDSA_SIGNATURE_LENGTH_INVALID),n.isNumber(i,o.RECOVERY_ID_TYPE_INVALID),n.isNumberInInterval(i,-1,4,o.RECOVERY_ID_VALUE_INVALID),f=a(f,!0),t.recover(e,r,i,f)},ecdh:function(e,r){return n.isBuffer(e,o.EC_PUBLIC_KEY_TYPE_INVALID),n.isBufferLength2(e,33,65,o.EC_PUBLIC_KEY_LENGTH_INVALID),n.isBuffer(r,o.EC_PRIVATE_KEY_TYPE_INVALID),n.isBufferLength(r,32,o.EC_PRIVATE_KEY_LENGTH_INVALID),t.ecdh(e,r)},ecdhUnsafe:function(e,r,i){return n.isBuffer(e,o.EC_PUBLIC_KEY_TYPE_INVALID),n.isBufferLength2(e,33,65,o.EC_PUBLIC_KEY_LENGTH_INVALID),n.isBuffer(r,o.EC_PRIVATE_KEY_TYPE_INVALID),n.isBufferLength(r,32,o.EC_PRIVATE_KEY_LENGTH_INVALID),i=a(i,!0),t.ecdhUnsafe(e,r,i)}}}},function(t,e,r){"use strict";(function(t){var r=Object.prototype.toString;e.isArray=function(t,e){if(!Array.isArray(t))throw TypeError(e)},e.isBoolean=function(t,e){if("[object Boolean]"!==r.call(t))throw TypeError(e)},e.isBuffer=function(e,r){if(!t.isBuffer(e))throw TypeError(r)},e.isFunction=function(t,e){if("[object Function]"!==r.call(t))throw TypeError(e)},e.isNumber=function(t,e){if("[object Number]"!==r.call(t))throw TypeError(e)},e.isObject=function(t,e){if("[object Object]"!==r.call(t))throw TypeError(e)},e.isBufferLength=function(t,e,r){if(t.length!==e)throw RangeError(r)},e.isBufferLength2=function(t,e,r,n){if(t.length!==e&&t.length!==r)throw RangeError(n)},e.isLengthGTZero=function(t,e){if(0===t.length)throw RangeError(e)},e.isNumberInInterval=function(t,e,r,n){if(t<=e||t>=r)throw RangeError(n)}}).call(this,r(11).Buffer)},function(t,e,r){"use strict";var n=r(1).Buffer,i=r(88),o=n.from([48,129,211,2,1,1,4,32,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,129,133,48,129,130,2,1,1,48,44,6,7,42,134,72,206,61,1,1,2,33,0,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,254,255,255,252,47,48,6,4,1,0,4,1,7,4,33,2,121,190,102,126,249,220,187,172,85,160,98,149,206,135,11,7,2,155,252,219,45,206,40,217,89,242,129,91,22,248,23,152,2,33,0,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,254,186,174,220,230,175,72,160,59,191,210,94,140,208,54,65,65,2,1,1,161,36,3,34,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]),a=n.from([48,130,1,19,2,1,1,4,32,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,129,165,48,129,162,2,1,1,48,44,6,7,42,134,72,206,61,1,1,2,33,0,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,254,255,255,252,47,48,6,4,1,0,4,1,7,4,65,4,121,190,102,126,249,220,187,172,85,160,98,149,206,135,11,7,2,155,252,219,45,206,40,217,89,242,129,91,22,248,23,152,72,58,218,119,38,163,196,101,93,164,251,252,14,17,8,168,253,23,180,72,166,133,84,25,156,71,208,143,251,16,212,184,2,33,0,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,254,186,174,220,230,175,72,160,59,191,210,94,140,208,54,65,65,2,1,1,161,68,3,66,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);e.privateKeyExport=function(t,e,r){var i=n.from(r?o:a);return t.copy(i,r?8:9),e.copy(i,r?181:214),i},e.privateKeyImport=function(t){var e=t.length,r=0;if(!(e<r+1||48!==t[r])&&!(e<(r+=1)+1)&&128&t[r]){var n=127&t[r];if(r+=1,!(n<1||n>2||e<r+n)){var i=t[r+n-1]|(n>1?t[r+n-2]<<8:0);if(!(e<(r+=n)+i||e<r+3||2!==t[r]||1!==t[r+1]||1!==t[r+2]||e<(r+=3)+2||4!==t[r]||t[r+1]>32||e<r+2+t[r+1]))return t.slice(r+2,r+2+t[r+1])}}},e.signatureExport=function(t){for(var e=n.concat([n.from([0]),t.r]),r=33,o=0;r>1&&0===e[o]&&!(128&e[o+1]);--r,++o);for(var a=n.concat([n.from([0]),t.s]),f=33,s=0;f>1&&0===a[s]&&!(128&a[s+1]);--f,++s);return i.encode(e.slice(o),a.slice(s))},e.signatureImport=function(t){var e=n.alloc(32,0),r=n.alloc(32,0);try{var o=i.decode(t);if(33===o.r.length&&0===o.r[0]&&(o.r=o.r.slice(1)),o.r.length>32)throw new Error("R length is too long");if(33===o.s.length&&0===o.s[0]&&(o.s=o.s.slice(1)),o.s.length>32)throw new Error("S length is too long")}catch(t){return}return o.r.copy(e,32-o.r.length),o.s.copy(r,32-o.s.length),{r:e,s:r}},e.signatureImportLax=function(t){var e=n.alloc(32,0),r=n.alloc(32,0),i=t.length,o=0;if(48===t[o++]){var a=t[o++];if(!(128&a&&(o+=a-128)>i)&&2===t[o++]){var f=t[o++];if(128&f){if(o+(a=f-128)>i)return;for(;a>0&&0===t[o];o+=1,a-=1);for(f=0;a>0;o+=1,a-=1)f=(f<<8)+t[o]}if(!(f>i-o)){var s=o;if(o+=f,2===t[o++]){var c=t[o++];if(128&c){if(o+(a=c-128)>i)return;for(;a>0&&0===t[o];o+=1,a-=1);for(c=0;a>0;o+=1,a-=1)c=(c<<8)+t[o]}if(!(c>i-o)){var u=o;for(o+=c;f>0&&0===t[s];f-=1,s+=1);if(!(f>32)){var h=t.slice(s,s+f);for(h.copy(e,32-h.length);c>0&&0===t[u];c-=1,u+=1);if(!(c>32)){var d=t.slice(u,u+c);return d.copy(r,32-d.length),{r:e,s:r}}}}}}}}}},function(t,e,r){var n=r(1).Buffer;t.exports={check:function(t){if(t.length<8)return!1;if(t.length>72)return!1;if(48!==t[0])return!1;if(t[1]!==t.length-2)return!1;if(2!==t[2])return!1;var e=t[3];if(0===e)return!1;if(5+e>=t.length)return!1;if(2!==t[4+e])return!1;var r=t[5+e];return!(0===r||6+e+r!==t.length||128&t[4]||e>1&&0===t[4]&&!(128&t[5])||128&t[e+6]||r>1&&0===t[e+6]&&!(128&t[e+7]))},decode:function(t){if(t.length<8)throw new Error("DER sequence length is too short");if(t.length>72)throw new Error("DER sequence length is too long");if(48!==t[0])throw new Error("Expected DER sequence");if(t[1]!==t.length-2)throw new Error("DER sequence length is invalid");if(2!==t[2])throw new Error("Expected DER integer");var e=t[3];if(0===e)throw new Error("R length is zero");if(5+e>=t.length)throw new Error("R length is too long");if(2!==t[4+e])throw new Error("Expected DER integer (2)");var r=t[5+e];if(0===r)throw new Error("S length is zero");if(6+e+r!==t.length)throw new Error("S length is invalid");if(128&t[4])throw new Error("R value is negative");if(e>1&&0===t[4]&&!(128&t[5]))throw new Error("R value excessively padded");if(128&t[e+6])throw new Error("S value is negative");if(r>1&&0===t[e+6]&&!(128&t[e+7]))throw new Error("S value excessively padded");return{r:t.slice(4,4+e),s:t.slice(6+e)}},encode:function(t,e){var r=t.length,i=e.length;if(0===r)throw new Error("R length is zero");if(0===i)throw new Error("S length is zero");if(r>33)throw new Error("R length is too long");if(i>33)throw new Error("S length is too long");if(128&t[0])throw new Error("R value is negative");if(128&e[0])throw new Error("S value is negative");if(r>1&&0===t[0]&&!(128&t[1]))throw new Error("R value excessively padded");if(i>1&&0===e[0]&&!(128&e[1]))throw new Error("S value excessively padded");var o=n.allocUnsafe(6+r+i);return o[0]=48,o[1]=o.length-2,o[2]=2,o[3]=t.length,t.copy(o,4),o[4+r]=2,o[5+r]=e.length,e.copy(o,6+r),o}}},function(t,e,r){"use strict";var n=r(1).Buffer,i=r(37),o=r(3),a=r(2).ec,f=r(36),s=new a("secp256k1"),c=s.curve;function u(t){var e=t[0];switch(e){case 2:case 3:return 33!==t.length?null:function(t,e){var r=new o(e);if(r.cmp(c.p)>=0)return null;var n=(r=r.toRed(c.red)).redSqr().redIMul(r).redIAdd(c.b).redSqrt();return 3===t!==n.isOdd()&&(n=n.redNeg()),s.keyPair({pub:{x:r,y:n}})}(e,t.slice(1,33));case 4:case 6:case 7:return 65!==t.length?null:function(t,e,r){var n=new o(e),i=new o(r);if(n.cmp(c.p)>=0||i.cmp(c.p)>=0)return null;if(n=n.toRed(c.red),i=i.toRed(c.red),(6===t||7===t)&&i.isOdd()!==(7===t))return null;var a=n.redSqr().redIMul(n);return i.redSqr().redISub(a.redIAdd(c.b)).isZero()?s.keyPair({pub:{x:n,y:i}}):null}(e,t.slice(1,33),t.slice(33,65));default:return null}}e.privateKeyVerify=function(t){var e=new o(t);return e.cmp(c.n)<0&&!e.isZero()},e.privateKeyExport=function(t,e){var r=new o(t);if(r.cmp(c.n)>=0||r.isZero())throw new Error(f.EC_PRIVATE_KEY_EXPORT_DER_FAIL);return n.from(s.keyFromPrivate(t).getPublic(e,!0))},e.privateKeyNegate=function(t){var e=new o(t);return e.isZero()?n.alloc(32):c.n.sub(e).umod(c.n).toArrayLike(n,"be",32)},e.privateKeyModInverse=function(t){var e=new o(t);if(e.cmp(c.n)>=0||e.isZero())throw new Error(f.EC_PRIVATE_KEY_RANGE_INVALID);return e.invm(c.n).toArrayLike(n,"be",32)},e.privateKeyTweakAdd=function(t,e){var r=new o(e);if(r.cmp(c.n)>=0)throw new Error(f.EC_PRIVATE_KEY_TWEAK_ADD_FAIL);if(r.iadd(new o(t)),r.cmp(c.n)>=0&&r.isub(c.n),r.isZero())throw new Error(f.EC_PRIVATE_KEY_TWEAK_ADD_FAIL);return r.toArrayLike(n,"be",32)},e.privateKeyTweakMul=function(t,e){var r=new o(e);if(r.cmp(c.n)>=0||r.isZero())throw new Error(f.EC_PRIVATE_KEY_TWEAK_MUL_FAIL);return r.imul(new o(t)),r.cmp(c.n)&&(r=r.umod(c.n)),r.toArrayLike(n,"be",32)},e.publicKeyCreate=function(t,e){var r=new o(t);if(r.cmp(c.n)>=0||r.isZero())throw new Error(f.EC_PUBLIC_KEY_CREATE_FAIL);return n.from(s.keyFromPrivate(t).getPublic(e,!0))},e.publicKeyConvert=function(t,e){var r=u(t);if(null===r)throw new Error(f.EC_PUBLIC_KEY_PARSE_FAIL);return n.from(r.getPublic(e,!0))},e.publicKeyVerify=function(t){return null!==u(t)},e.publicKeyTweakAdd=function(t,e,r){var i=u(t);if(null===i)throw new Error(f.EC_PUBLIC_KEY_PARSE_FAIL);if((e=new o(e)).cmp(c.n)>=0)throw new Error(f.EC_PUBLIC_KEY_TWEAK_ADD_FAIL);return n.from(c.g.mul(e).add(i.pub).encode(!0,r))},e.publicKeyTweakMul=function(t,e,r){var i=u(t);if(null===i)throw new Error(f.EC_PUBLIC_KEY_PARSE_FAIL);if((e=new o(e)).cmp(c.n)>=0||e.isZero())throw new Error(f.EC_PUBLIC_KEY_TWEAK_MUL_FAIL);return n.from(i.pub.mul(e).encode(!0,r))},e.publicKeyCombine=function(t,e){for(var r=new Array(t.length),i=0;i<t.length;++i)if(r[i]=u(t[i]),null===r[i])throw new Error(f.EC_PUBLIC_KEY_PARSE_FAIL);for(var o=r[0].pub,a=1;a<r.length;++a)o=o.add(r[a].pub);if(o.isInfinity())throw new Error(f.EC_PUBLIC_KEY_COMBINE_FAIL);return n.from(o.encode(!0,e))},e.signatureNormalize=function(t){var e=new o(t.slice(0,32)),r=new o(t.slice(32,64));if(e.cmp(c.n)>=0||r.cmp(c.n)>=0)throw new Error(f.ECDSA_SIGNATURE_PARSE_FAIL);var i=n.from(t);return 1===r.cmp(s.nh)&&c.n.sub(r).toArrayLike(n,"be",32).copy(i,32),i},e.signatureExport=function(t){var e=t.slice(0,32),r=t.slice(32,64);if(new o(e).cmp(c.n)>=0||new o(r).cmp(c.n)>=0)throw new Error(f.ECDSA_SIGNATURE_PARSE_FAIL);return{r:e,s:r}},e.signatureImport=function(t){var e=new o(t.r);e.cmp(c.n)>=0&&(e=new o(0));var r=new o(t.s);return r.cmp(c.n)>=0&&(r=new o(0)),n.concat([e.toArrayLike(n,"be",32),r.toArrayLike(n,"be",32)])},e.sign=function(t,e,r,i){if("function"==typeof r){var a=r;r=function(r){var s=a(t,e,null,i,r);if(!n.isBuffer(s)||32!==s.length)throw new Error(f.ECDSA_SIGN_FAIL);return new o(s)}}var u=new o(e);if(u.cmp(c.n)>=0||u.isZero())throw new Error(f.ECDSA_SIGN_FAIL);var h=s.sign(t,e,{canonical:!0,k:r,pers:i});return{signature:n.concat([h.r.toArrayLike(n,"be",32),h.s.toArrayLike(n,"be",32)]),recovery:h.recoveryParam}},e.verify=function(t,e,r){var n={r:e.slice(0,32),s:e.slice(32,64)},i=new o(n.r),a=new o(n.s);if(i.cmp(c.n)>=0||a.cmp(c.n)>=0)throw new Error(f.ECDSA_SIGNATURE_PARSE_FAIL);if(1===a.cmp(s.nh)||i.isZero()||a.isZero())return!1;var h=u(r);if(null===h)throw new Error(f.EC_PUBLIC_KEY_PARSE_FAIL);return s.verify(t,n,{x:h.pub.x,y:h.pub.y})},e.recover=function(t,e,r,i){var a={r:e.slice(0,32),s:e.slice(32,64)},u=new o(a.r),h=new o(a.s);if(u.cmp(c.n)>=0||h.cmp(c.n)>=0)throw new Error(f.ECDSA_SIGNATURE_PARSE_FAIL);try{if(u.isZero()||h.isZero())throw new Error;var d=s.recoverPubKey(t,a,r);return n.from(d.encode(!0,i))}catch(t){throw new Error(f.ECDSA_RECOVER_FAIL)}},e.ecdh=function(t,r){var n=e.ecdhUnsafe(t,r,!0);return i("sha256").update(n).digest()},e.ecdhUnsafe=function(t,e,r){var i=u(t);if(null===i)throw new Error(f.EC_PUBLIC_KEY_PARSE_FAIL);var a=new o(e);if(a.cmp(c.n)>=0||a.isZero())throw new Error(f.ECDH_FAIL);return n.from(i.pub.mul(a).encode(!0,r))}},function(t,e,r){"use strict";var n=r(0),i=r(38),o=r(1).Buffer,a=new Array(16);function f(){i.call(this,64),this._a=1732584193,this._b=4023233417,this._c=2562383102,this._d=271733878}function s(t,e){return t<<e|t>>>32-e}function c(t,e,r,n,i,o,a){return s(t+(e&r|~e&n)+i+o|0,a)+e|0}function u(t,e,r,n,i,o,a){return s(t+(e&n|r&~n)+i+o|0,a)+e|0}function h(t,e,r,n,i,o,a){return s(t+(e^r^n)+i+o|0,a)+e|0}function d(t,e,r,n,i,o,a){return s(t+(r^(e|~n))+i+o|0,a)+e|0}n(f,i),f.prototype._update=function(){for(var t=a,e=0;e<16;++e)t[e]=this._block.readInt32LE(4*e);var r=this._a,n=this._b,i=this._c,o=this._d;n=d(n=d(n=d(n=d(n=h(n=h(n=h(n=h(n=u(n=u(n=u(n=u(n=c(n=c(n=c(n=c(n,i=c(i,o=c(o,r=c(r,n,i,o,t[0],3614090360,7),n,i,t[1],3905402710,12),r,n,t[2],606105819,17),o,r,t[3],3250441966,22),i=c(i,o=c(o,r=c(r,n,i,o,t[4],4118548399,7),n,i,t[5],1200080426,12),r,n,t[6],2821735955,17),o,r,t[7],4249261313,22),i=c(i,o=c(o,r=c(r,n,i,o,t[8],1770035416,7),n,i,t[9],2336552879,12),r,n,t[10],4294925233,17),o,r,t[11],2304563134,22),i=c(i,o=c(o,r=c(r,n,i,o,t[12],1804603682,7),n,i,t[13],4254626195,12),r,n,t[14],2792965006,17),o,r,t[15],1236535329,22),i=u(i,o=u(o,r=u(r,n,i,o,t[1],4129170786,5),n,i,t[6],3225465664,9),r,n,t[11],643717713,14),o,r,t[0],3921069994,20),i=u(i,o=u(o,r=u(r,n,i,o,t[5],3593408605,5),n,i,t[10],38016083,9),r,n,t[15],3634488961,14),o,r,t[4],3889429448,20),i=u(i,o=u(o,r=u(r,n,i,o,t[9],568446438,5),n,i,t[14],3275163606,9),r,n,t[3],4107603335,14),o,r,t[8],1163531501,20),i=u(i,o=u(o,r=u(r,n,i,o,t[13],2850285829,5),n,i,t[2],4243563512,9),r,n,t[7],1735328473,14),o,r,t[12],2368359562,20),i=h(i,o=h(o,r=h(r,n,i,o,t[5],4294588738,4),n,i,t[8],2272392833,11),r,n,t[11],1839030562,16),o,r,t[14],4259657740,23),i=h(i,o=h(o,r=h(r,n,i,o,t[1],2763975236,4),n,i,t[4],1272893353,11),r,n,t[7],4139469664,16),o,r,t[10],3200236656,23),i=h(i,o=h(o,r=h(r,n,i,o,t[13],681279174,4),n,i,t[0],3936430074,11),r,n,t[3],3572445317,16),o,r,t[6],76029189,23),i=h(i,o=h(o,r=h(r,n,i,o,t[9],3654602809,4),n,i,t[12],3873151461,11),r,n,t[15],530742520,16),o,r,t[2],3299628645,23),i=d(i,o=d(o,r=d(r,n,i,o,t[0],4096336452,6),n,i,t[7],1126891415,10),r,n,t[14],2878612391,15),o,r,t[5],4237533241,21),i=d(i,o=d(o,r=d(r,n,i,o,t[12],1700485571,6),n,i,t[3],2399980690,10),r,n,t[10],4293915773,15),o,r,t[1],2240044497,21),i=d(i,o=d(o,r=d(r,n,i,o,t[8],1873313359,6),n,i,t[15],4264355552,10),r,n,t[6],2734768916,15),o,r,t[13],1309151649,21),i=d(i,o=d(o,r=d(r,n,i,o,t[4],4149444226,6),n,i,t[11],3174756917,10),r,n,t[2],718787259,15),o,r,t[9],3951481745,21),this._a=this._a+r|0,this._b=this._b+n|0,this._c=this._c+i|0,this._d=this._d+o|0},f.prototype._digest=function(){this._block[this._blockOffset++]=128,this._blockOffset>56&&(this._block.fill(0,this._blockOffset,64),this._update(),this._blockOffset=0),this._block.fill(0,this._blockOffset,56),this._block.writeUInt32LE(this._length[0],56),this._block.writeUInt32LE(this._length[1],60),this._update();var t=o.allocUnsafe(16);return t.writeInt32LE(this._a,0),t.writeInt32LE(this._b,4),t.writeInt32LE(this._c,8),t.writeInt32LE(this._d,12),t},t.exports=f},function(t,e,r){"use strict";var n=r(11).Buffer,i=r(0),o=r(38),a=new Array(16),f=[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,7,4,13,1,10,6,15,3,12,0,9,5,2,14,11,8,3,10,14,4,9,15,8,1,2,7,0,6,13,11,5,12,1,9,11,10,0,8,12,4,13,3,7,15,14,5,6,2,4,0,5,9,7,12,2,10,14,1,3,8,11,6,15,13],s=[5,14,7,0,9,2,11,4,13,6,15,8,1,10,3,12,6,11,3,7,0,13,5,10,14,15,8,12,4,9,1,2,15,5,1,3,7,14,6,9,11,8,12,2,10,0,4,13,8,6,4,1,3,11,15,0,5,12,2,13,9,7,10,14,12,15,10,4,1,5,8,7,6,2,13,14,0,3,9,11],c=[11,14,15,12,5,8,7,9,11,13,14,15,6,7,9,8,7,6,8,13,11,9,7,15,7,12,15,9,11,7,13,12,11,13,6,7,14,9,13,15,14,8,13,6,5,12,7,5,11,12,14,15,14,15,9,8,9,14,5,6,8,6,5,12,9,15,5,11,6,8,13,12,5,12,13,14,11,8,5,6],u=[8,9,9,11,13,15,15,5,7,7,8,11,14,14,12,6,9,13,15,7,12,8,9,11,7,7,12,7,6,15,13,11,9,7,15,11,8,6,6,14,12,13,5,14,13,13,7,5,15,5,8,11,14,14,6,14,6,9,12,9,12,5,15,8,8,5,12,9,12,5,14,6,8,13,6,5,15,13,11,11],h=[0,1518500249,1859775393,2400959708,2840853838],d=[1352829926,1548603684,1836072691,2053994217,0];function l(){o.call(this,64),this._a=1732584193,this._b=4023233417,this._c=2562383102,this._d=271733878,this._e=3285377520}function p(t,e){return t<<e|t>>>32-e}function b(t,e,r,n,i,o,a,f){return p(t+(e^r^n)+o+a|0,f)+i|0}function y(t,e,r,n,i,o,a,f){return p(t+(e&r|~e&n)+o+a|0,f)+i|0}function v(t,e,r,n,i,o,a,f){return p(t+((e|~r)^n)+o+a|0,f)+i|0}function g(t,e,r,n,i,o,a,f){return p(t+(e&n|r&~n)+o+a|0,f)+i|0}function m(t,e,r,n,i,o,a,f){return p(t+(e^(r|~n))+o+a|0,f)+i|0}i(l,o),l.prototype._update=function(){for(var t=a,e=0;e<16;++e)t[e]=this._block.readInt32LE(4*e);for(var r=0|this._a,n=0|this._b,i=0|this._c,o=0|this._d,l=0|this._e,_=0|this._a,w=0|this._b,S=0|this._c,E=0|this._d,M=0|this._e,A=0;A<80;A+=1){var x,k;A<16?(x=b(r,n,i,o,l,t[f[A]],h[0],c[A]),k=m(_,w,S,E,M,t[s[A]],d[0],u[A])):A<32?(x=y(r,n,i,o,l,t[f[A]],h[1],c[A]),k=g(_,w,S,E,M,t[s[A]],d[1],u[A])):A<48?(x=v(r,n,i,o,l,t[f[A]],h[2],c[A]),k=v(_,w,S,E,M,t[s[A]],d[2],u[A])):A<64?(x=g(r,n,i,o,l,t[f[A]],h[3],c[A]),k=y(_,w,S,E,M,t[s[A]],d[3],u[A])):(x=m(r,n,i,o,l,t[f[A]],h[4],c[A]),k=b(_,w,S,E,M,t[s[A]],d[4],u[A])),r=l,l=o,o=p(i,10),i=n,n=x,_=M,M=E,E=p(S,10),S=w,w=k}var I=this._b+i+E|0;this._b=this._c+o+M|0,this._c=this._d+l+_|0,this._d=this._e+r+w|0,this._e=this._a+n+S|0,this._a=I},l.prototype._digest=function(){this._block[this._blockOffset++]=128,this._blockOffset>56&&(this._block.fill(0,this._blockOffset,64),this._update(),this._blockOffset=0),this._block.fill(0,this._blockOffset,56),this._block.writeUInt32LE(this._length[0],56),this._block.writeUInt32LE(this._length[1],60),this._update();var t=n.alloc?n.alloc(20):new n(20);return t.writeInt32LE(this._a,0),t.writeInt32LE(this._b,4),t.writeInt32LE(this._c,8),t.writeInt32LE(this._d,12),t.writeInt32LE(this._e,16),t},t.exports=l},function(t,e,r){(e=t.exports=function(t){t=t.toLowerCase();var r=e[t];if(!r)throw new Error(t+" is not supported (we accept pull requests)");return new r}).sha=r(93),e.sha1=r(94),e.sha224=r(95),e.sha256=r(39),e.sha384=r(96),e.sha512=r(40)},function(t,e,r){var n=r(0),i=r(10),o=r(1).Buffer,a=[1518500249,1859775393,-1894007588,-899497514],f=new Array(80);function s(){this.init(),this._w=f,i.call(this,64,56)}function c(t){return t<<5|t>>>27}function u(t){return t<<30|t>>>2}function h(t,e,r,n){return 0===t?e&r|~e&n:2===t?e&r|e&n|r&n:e^r^n}n(s,i),s.prototype.init=function(){return this._a=1732584193,this._b=4023233417,this._c=2562383102,this._d=271733878,this._e=3285377520,this},s.prototype._update=function(t){for(var e=this._w,r=0|this._a,n=0|this._b,i=0|this._c,o=0|this._d,f=0|this._e,s=0;s<16;++s)e[s]=t.readInt32BE(4*s);for(;s<80;++s)e[s]=e[s-3]^e[s-8]^e[s-14]^e[s-16];for(var d=0;d<80;++d){var l=~~(d/20),p=c(r)+h(l,n,i,o)+f+e[d]+a[l]|0;f=o,o=i,i=u(n),n=r,r=p}this._a=r+this._a|0,this._b=n+this._b|0,this._c=i+this._c|0,this._d=o+this._d|0,this._e=f+this._e|0},s.prototype._hash=function(){var t=o.allocUnsafe(20);return t.writeInt32BE(0|this._a,0),t.writeInt32BE(0|this._b,4),t.writeInt32BE(0|this._c,8),t.writeInt32BE(0|this._d,12),t.writeInt32BE(0|this._e,16),t},t.exports=s},function(t,e,r){var n=r(0),i=r(10),o=r(1).Buffer,a=[1518500249,1859775393,-1894007588,-899497514],f=new Array(80);function s(){this.init(),this._w=f,i.call(this,64,56)}function c(t){return t<<1|t>>>31}function u(t){return t<<5|t>>>27}function h(t){return t<<30|t>>>2}function d(t,e,r,n){return 0===t?e&r|~e&n:2===t?e&r|e&n|r&n:e^r^n}n(s,i),s.prototype.init=function(){return this._a=1732584193,this._b=4023233417,this._c=2562383102,this._d=271733878,this._e=3285377520,this},s.prototype._update=function(t){for(var e=this._w,r=0|this._a,n=0|this._b,i=0|this._c,o=0|this._d,f=0|this._e,s=0;s<16;++s)e[s]=t.readInt32BE(4*s);for(;s<80;++s)e[s]=c(e[s-3]^e[s-8]^e[s-14]^e[s-16]);for(var l=0;l<80;++l){var p=~~(l/20),b=u(r)+d(p,n,i,o)+f+e[l]+a[p]|0;f=o,o=i,i=h(n),n=r,r=b}this._a=r+this._a|0,this._b=n+this._b|0,this._c=i+this._c|0,this._d=o+this._d|0,this._e=f+this._e|0},s.prototype._hash=function(){var t=o.allocUnsafe(20);return t.writeInt32BE(0|this._a,0),t.writeInt32BE(0|this._b,4),t.writeInt32BE(0|this._c,8),t.writeInt32BE(0|this._d,12),t.writeInt32BE(0|this._e,16),t},t.exports=s},function(t,e,r){var n=r(0),i=r(39),o=r(10),a=r(1).Buffer,f=new Array(64);function s(){this.init(),this._w=f,o.call(this,64,56)}n(s,i),s.prototype.init=function(){return this._a=3238371032,this._b=914150663,this._c=812702999,this._d=4144912697,this._e=4290775857,this._f=1750603025,this._g=1694076839,this._h=3204075428,this},s.prototype._hash=function(){var t=a.allocUnsafe(28);return t.writeInt32BE(this._a,0),t.writeInt32BE(this._b,4),t.writeInt32BE(this._c,8),t.writeInt32BE(this._d,12),t.writeInt32BE(this._e,16),t.writeInt32BE(this._f,20),t.writeInt32BE(this._g,24),t},t.exports=s},function(t,e,r){var n=r(0),i=r(40),o=r(10),a=r(1).Buffer,f=new Array(160);function s(){this.init(),this._w=f,o.call(this,128,112)}n(s,i),s.prototype.init=function(){return this._ah=3418070365,this._bh=1654270250,this._ch=2438529370,this._dh=355462360,this._eh=1731405415,this._fh=2394180231,this._gh=3675008525,this._hh=1203062813,this._al=3238371032,this._bl=914150663,this._cl=812702999,this._dl=4144912697,this._el=4290775857,this._fl=1750603025,this._gl=1694076839,this._hl=3204075428,this},s.prototype._hash=function(){var t=a.allocUnsafe(48);function e(e,r,n){t.writeInt32BE(e,n),t.writeInt32BE(r,n+4)}return e(this._ah,this._al,0),e(this._bh,this._bl,8),e(this._ch,this._cl,16),e(this._dh,this._dl,24),e(this._eh,this._el,32),e(this._fh,this._fl,40),t},t.exports=s},function(t,e,r){var n=r(1).Buffer,i=r(16).Transform,o=r(21).StringDecoder;function a(t){i.call(this),this.hashMode="string"==typeof t,this.hashMode?this[t]=this._finalOrDigest:this.final=this._finalOrDigest,this._final&&(this.__final=this._final,this._final=null),this._decoder=null,this._encoding=null}r(0)(a,i),a.prototype.update=function(t,e,r){"string"==typeof t&&(t=n.from(t,e));var i=this._update(t);return this.hashMode?this:(r&&(i=this._toString(i,r)),i)},a.prototype.setAutoPadding=function(){},a.prototype.getAuthTag=function(){throw new Error("trying to get auth tag in unsupported state")},a.prototype.setAuthTag=function(){throw new Error("trying to set auth tag in unsupported state")},a.prototype.setAAD=function(){throw new Error("trying to set aad in unsupported state")},a.prototype._transform=function(t,e,r){var n;try{this.hashMode?this._update(t):this.push(this._update(t))}catch(t){n=t}finally{r(n)}},a.prototype._flush=function(t){var e;try{this.push(this.__final())}catch(t){e=t}t(e)},a.prototype._finalOrDigest=function(t){var e=this.__final()||n.alloc(0);return t&&(e=this._toString(e,t,!0)),e},a.prototype._toString=function(t,e,r){if(this._decoder||(this._decoder=new o(e),this._encoding=e),this._encoding!==e)throw new Error("can't switch encodings");var n=this._decoder.write(t);return r&&(n+=this._decoder.end()),n},t.exports=a},function(t,e){},function(t){t.exports={_from:"elliptic@^6.2.3",_id:"elliptic@6.4.1",_inBundle:!1,_integrity:"sha512-BsXLz5sqX8OHcsh7CqBMztyXARmGQ3LWPtGjJi6DiJHq5C/qvi9P3OqgswKSDftbu8+IoI/QDTAm2fFnQ9SZSQ==",_location:"/elliptic",_phantomChildren:{},_requested:{type:"range",registry:!0,raw:"elliptic@^6.2.3",name:"elliptic",escapedName:"elliptic",rawSpec:"^6.2.3",saveSpec:null,fetchSpec:"^6.2.3"},_requiredBy:["/browserify-sign","/create-ecdh","/secp256k1"],_resolved:"https://registry.npmjs.org/elliptic/-/elliptic-6.4.1.tgz",_shasum:"c2d0b7776911b86722c632c3c06c60f2f819939a",_spec:"elliptic@^6.2.3",_where:"/Users/pedrogomes/_walletconnect/walletconnect-monorepo/packages/walletconnect-web3-provider/node_modules/secp256k1",author:{name:"Fedor Indutny",email:"fedor@indutny.com"},bugs:{url:"https://github.com/indutny/elliptic/issues"},bundleDependencies:!1,dependencies:{"bn.js":"^4.4.0",brorand:"^1.0.1","hash.js":"^1.0.0","hmac-drbg":"^1.0.0",inherits:"^2.0.1","minimalistic-assert":"^1.0.0","minimalistic-crypto-utils":"^1.0.0"},deprecated:!1,description:"EC cryptography",devDependencies:{brfs:"^1.4.3",coveralls:"^2.11.3",grunt:"^0.4.5","grunt-browserify":"^5.0.0","grunt-cli":"^1.2.0","grunt-contrib-connect":"^1.0.0","grunt-contrib-copy":"^1.0.0","grunt-contrib-uglify":"^1.0.1","grunt-mocha-istanbul":"^3.0.1","grunt-saucelabs":"^8.6.2",istanbul:"^0.4.2",jscs:"^2.9.0",jshint:"^2.6.0",mocha:"^2.1.0"},files:["lib"],homepage:"https://github.com/indutny/elliptic",keywords:["EC","Elliptic","curve","Cryptography"],license:"MIT",main:"lib/elliptic.js",name:"elliptic",repository:{type:"git",url:"git+ssh://git@github.com/indutny/elliptic.git"},scripts:{jscs:"jscs benchmarks/*.js lib/*.js lib/**/*.js lib/**/**/*.js test/index.js",jshint:"jscs benchmarks/*.js lib/*.js lib/**/*.js lib/**/**/*.js test/index.js",lint:"npm run jscs && npm run jshint",test:"npm run lint && npm run unit",unit:"istanbul test _mocha --reporter=spec test/index.js",version:"grunt dist && git add dist/"},version:"6.4.1"}},function(t,e,r){"use strict";var n=e,i=r(3),o=r(8),a=r(41);n.assert=o,n.toArray=a.toArray,n.zero2=a.zero2,n.toHex=a.toHex,n.encode=a.encode,n.getNAF=function(t,e){for(var r=[],n=1<<e+1,i=t.clone();i.cmpn(1)>=0;){var o;if(i.isOdd()){var a=i.andln(n-1);o=a>(n>>1)-1?(n>>1)-a:a,i.isubn(o)}else o=0;r.push(o);for(var f=0!==i.cmpn(0)&&0===i.andln(n-1)?e+1:1,s=1;s<f;s++)r.push(0);i.iushrn(f)}return r},n.getJSF=function(t,e){var r=[[],[]];t=t.clone(),e=e.clone();for(var n=0,i=0;t.cmpn(-n)>0||e.cmpn(-i)>0;){var o,a,f,s=t.andln(3)+n&3,c=e.andln(3)+i&3;3===s&&(s=-1),3===c&&(c=-1),o=0==(1&s)?0:3!=(f=t.andln(7)+n&7)&&5!==f||2!==c?s:-s,r[0].push(o),a=0==(1&c)?0:3!=(f=e.andln(7)+i&7)&&5!==f||2!==s?c:-c,r[1].push(a),2*n===o+1&&(n=1-n),2*i===a+1&&(i=1-i),t.iushrn(1),e.iushrn(1)}return r},n.cachedProperty=function(t,e,r){var n="_"+e;t.prototype[e]=function(){return void 0!==this[n]?this[n]:this[n]=r.call(this)}},n.parseBytes=function(t){return"string"==typeof t?n.toArray(t,"hex"):t},n.intFromLE=function(t){return new i(t,"hex","le")}},function(t,e,r){var n;function i(t){this.rand=t}if(t.exports=function(t){return n||(n=new i(null)),n.generate(t)},t.exports.Rand=i,i.prototype.generate=function(t){return this._rand(t)},i.prototype._rand=function(t){if(this.rand.getBytes)return this.rand.getBytes(t);for(var e=new Uint8Array(t),r=0;r<e.length;r++)e[r]=this.rand.getByte();return e},"object"==typeof self)self.crypto&&self.crypto.getRandomValues?i.prototype._rand=function(t){var e=new Uint8Array(t);return self.crypto.getRandomValues(e),e}:self.msCrypto&&self.msCrypto.getRandomValues?i.prototype._rand=function(t){var e=new Uint8Array(t);return self.msCrypto.getRandomValues(e),e}:"object"==typeof window&&(i.prototype._rand=function(){throw new Error("Not implemented yet")});else try{var o=r(102);if("function"!=typeof o.randomBytes)throw new Error("Not supported");i.prototype._rand=function(t){return o.randomBytes(t)}}catch(t){}},function(t,e){},function(t,e,r){"use strict";var n=r(3),i=r(2).utils,o=i.getNAF,a=i.getJSF,f=i.assert;function s(t,e){this.type=t,this.p=new n(e.p,16),this.red=e.prime?n.red(e.prime):n.mont(this.p),this.zero=new n(0).toRed(this.red),this.one=new n(1).toRed(this.red),this.two=new n(2).toRed(this.red),this.n=e.n&&new n(e.n,16),this.g=e.g&&this.pointFromJSON(e.g,e.gRed),this._wnafT1=new Array(4),this._wnafT2=new Array(4),this._wnafT3=new Array(4),this._wnafT4=new Array(4);var r=this.n&&this.p.div(this.n);!r||r.cmpn(100)>0?this.redN=null:(this._maxwellTrick=!0,this.redN=this.n.toRed(this.red))}function c(t,e){this.curve=t,this.type=e,this.precomputed=null}t.exports=s,s.prototype.point=function(){throw new Error("Not implemented")},s.prototype.validate=function(){throw new Error("Not implemented")},s.prototype._fixedNafMul=function(t,e){f(t.precomputed);var r=t._getDoubles(),n=o(e,1),i=(1<<r.step+1)-(r.step%2==0?2:1);i/=3;for(var a=[],s=0;s<n.length;s+=r.step){var c=0;for(e=s+r.step-1;e>=s;e--)c=(c<<1)+n[e];a.push(c)}for(var u=this.jpoint(null,null,null),h=this.jpoint(null,null,null),d=i;d>0;d--){for(s=0;s<a.length;s++){(c=a[s])===d?h=h.mixedAdd(r.points[s]):c===-d&&(h=h.mixedAdd(r.points[s].neg()))}u=u.add(h)}return u.toP()},s.prototype._wnafMul=function(t,e){var r=4,n=t._getNAFPoints(r);r=n.wnd;for(var i=n.points,a=o(e,r),s=this.jpoint(null,null,null),c=a.length-1;c>=0;c--){for(e=0;c>=0&&0===a[c];c--)e++;if(c>=0&&e++,s=s.dblp(e),c<0)break;var u=a[c];f(0!==u),s="affine"===t.type?u>0?s.mixedAdd(i[u-1>>1]):s.mixedAdd(i[-u-1>>1].neg()):u>0?s.add(i[u-1>>1]):s.add(i[-u-1>>1].neg())}return"affine"===t.type?s.toP():s},s.prototype._wnafMulAdd=function(t,e,r,n,i){for(var f=this._wnafT1,s=this._wnafT2,c=this._wnafT3,u=0,h=0;h<n;h++){var d=(A=e[h])._getNAFPoints(t);f[h]=d.wnd,s[h]=d.points}for(h=n-1;h>=1;h-=2){var l=h-1,p=h;if(1===f[l]&&1===f[p]){var b=[e[l],null,null,e[p]];0===e[l].y.cmp(e[p].y)?(b[1]=e[l].add(e[p]),b[2]=e[l].toJ().mixedAdd(e[p].neg())):0===e[l].y.cmp(e[p].y.redNeg())?(b[1]=e[l].toJ().mixedAdd(e[p]),b[2]=e[l].add(e[p].neg())):(b[1]=e[l].toJ().mixedAdd(e[p]),b[2]=e[l].toJ().mixedAdd(e[p].neg()));var y=[-3,-1,-5,-7,0,7,5,1,3],v=a(r[l],r[p]);u=Math.max(v[0].length,u),c[l]=new Array(u),c[p]=new Array(u);for(var g=0;g<u;g++){var m=0|v[0][g],_=0|v[1][g];c[l][g]=y[3*(m+1)+(_+1)],c[p][g]=0,s[l]=b}}else c[l]=o(r[l],f[l]),c[p]=o(r[p],f[p]),u=Math.max(c[l].length,u),u=Math.max(c[p].length,u)}var w=this.jpoint(null,null,null),S=this._wnafT4;for(h=u;h>=0;h--){for(var E=0;h>=0;){var M=!0;for(g=0;g<n;g++)S[g]=0|c[g][h],0!==S[g]&&(M=!1);if(!M)break;E++,h--}if(h>=0&&E++,w=w.dblp(E),h<0)break;for(g=0;g<n;g++){var A,x=S[g];0!==x&&(x>0?A=s[g][x-1>>1]:x<0&&(A=s[g][-x-1>>1].neg()),w="affine"===A.type?w.mixedAdd(A):w.add(A))}}for(h=0;h<n;h++)s[h]=null;return i?w:w.toP()},s.BasePoint=c,c.prototype.eq=function(){throw new Error("Not implemented")},c.prototype.validate=function(){return this.curve.validate(this)},s.prototype.decodePoint=function(t,e){t=i.toArray(t,e);var r=this.p.byteLength();if((4===t[0]||6===t[0]||7===t[0])&&t.length-1==2*r)return 6===t[0]?f(t[t.length-1]%2==0):7===t[0]&&f(t[t.length-1]%2==1),this.point(t.slice(1,1+r),t.slice(1+r,1+2*r));if((2===t[0]||3===t[0])&&t.length-1===r)return this.pointFromX(t.slice(1,1+r),3===t[0]);throw new Error("Unknown point format")},c.prototype.encodeCompressed=function(t){return this.encode(t,!0)},c.prototype._encode=function(t){var e=this.curve.p.byteLength(),r=this.getX().toArray("be",e);return t?[this.getY().isEven()?2:3].concat(r):[4].concat(r,this.getY().toArray("be",e))},c.prototype.encode=function(t,e){return i.encode(this._encode(e),t)},c.prototype.precompute=function(t){if(this.precomputed)return this;var e={doubles:null,naf:null,beta:null};return e.naf=this._getNAFPoints(8),e.doubles=this._getDoubles(4,t),e.beta=this._getBeta(),this.precomputed=e,this},c.prototype._hasDoubles=function(t){if(!this.precomputed)return!1;var e=this.precomputed.doubles;return!!e&&e.points.length>=Math.ceil((t.bitLength()+1)/e.step)},c.prototype._getDoubles=function(t,e){if(this.precomputed&&this.precomputed.doubles)return this.precomputed.doubles;for(var r=[this],n=this,i=0;i<e;i+=t){for(var o=0;o<t;o++)n=n.dbl();r.push(n)}return{step:t,points:r}},c.prototype._getNAFPoints=function(t){if(this.precomputed&&this.precomputed.naf)return this.precomputed.naf;for(var e=[this],r=(1<<t)-1,n=1===r?null:this.dbl(),i=1;i<r;i++)e[i]=e[i-1].add(n);return{wnd:t,points:e}},c.prototype._getBeta=function(){return null},c.prototype.dblp=function(t){for(var e=this,r=0;r<t;r++)e=e.dbl();return e}},function(t,e,r){"use strict";var n=r(18),i=r(2),o=r(3),a=r(0),f=n.base,s=i.utils.assert;function c(t){f.call(this,"short",t),this.a=new o(t.a,16).toRed(this.red),this.b=new o(t.b,16).toRed(this.red),this.tinv=this.two.redInvm(),this.zeroA=0===this.a.fromRed().cmpn(0),this.threeA=0===this.a.fromRed().sub(this.p).cmpn(-3),this.endo=this._getEndomorphism(t),this._endoWnafT1=new Array(4),this._endoWnafT2=new Array(4)}function u(t,e,r,n){f.BasePoint.call(this,t,"affine"),null===e&&null===r?(this.x=null,this.y=null,this.inf=!0):(this.x=new o(e,16),this.y=new o(r,16),n&&(this.x.forceRed(this.curve.red),this.y.forceRed(this.curve.red)),this.x.red||(this.x=this.x.toRed(this.curve.red)),this.y.red||(this.y=this.y.toRed(this.curve.red)),this.inf=!1)}function h(t,e,r,n){f.BasePoint.call(this,t,"jacobian"),null===e&&null===r&&null===n?(this.x=this.curve.one,this.y=this.curve.one,this.z=new o(0)):(this.x=new o(e,16),this.y=new o(r,16),this.z=new o(n,16)),this.x.red||(this.x=this.x.toRed(this.curve.red)),this.y.red||(this.y=this.y.toRed(this.curve.red)),this.z.red||(this.z=this.z.toRed(this.curve.red)),this.zOne=this.z===this.curve.one}a(c,f),t.exports=c,c.prototype._getEndomorphism=function(t){if(this.zeroA&&this.g&&this.n&&1===this.p.modn(3)){var e,r;if(t.beta)e=new o(t.beta,16).toRed(this.red);else{var n=this._getEndoRoots(this.p);e=(e=n[0].cmp(n[1])<0?n[0]:n[1]).toRed(this.red)}if(t.lambda)r=new o(t.lambda,16);else{var i=this._getEndoRoots(this.n);0===this.g.mul(i[0]).x.cmp(this.g.x.redMul(e))?r=i[0]:(r=i[1],s(0===this.g.mul(r).x.cmp(this.g.x.redMul(e))))}return{beta:e,lambda:r,basis:t.basis?t.basis.map(function(t){return{a:new o(t.a,16),b:new o(t.b,16)}}):this._getEndoBasis(r)}}},c.prototype._getEndoRoots=function(t){var e=t===this.p?this.red:o.mont(t),r=new o(2).toRed(e).redInvm(),n=r.redNeg(),i=new o(3).toRed(e).redNeg().redSqrt().redMul(r);return[n.redAdd(i).fromRed(),n.redSub(i).fromRed()]},c.prototype._getEndoBasis=function(t){for(var e,r,n,i,a,f,s,c,u,h=this.n.ushrn(Math.floor(this.n.bitLength()/2)),d=t,l=this.n.clone(),p=new o(1),b=new o(0),y=new o(0),v=new o(1),g=0;0!==d.cmpn(0);){var m=l.div(d);c=l.sub(m.mul(d)),u=y.sub(m.mul(p));var _=v.sub(m.mul(b));if(!n&&c.cmp(h)<0)e=s.neg(),r=p,n=c.neg(),i=u;else if(n&&2==++g)break;s=c,l=d,d=c,y=p,p=u,v=b,b=_}a=c.neg(),f=u;var w=n.sqr().add(i.sqr());return a.sqr().add(f.sqr()).cmp(w)>=0&&(a=e,f=r),n.negative&&(n=n.neg(),i=i.neg()),a.negative&&(a=a.neg(),f=f.neg()),[{a:n,b:i},{a:a,b:f}]},c.prototype._endoSplit=function(t){var e=this.endo.basis,r=e[0],n=e[1],i=n.b.mul(t).divRound(this.n),o=r.b.neg().mul(t).divRound(this.n),a=i.mul(r.a),f=o.mul(n.a),s=i.mul(r.b),c=o.mul(n.b);return{k1:t.sub(a).sub(f),k2:s.add(c).neg()}},c.prototype.pointFromX=function(t,e){(t=new o(t,16)).red||(t=t.toRed(this.red));var r=t.redSqr().redMul(t).redIAdd(t.redMul(this.a)).redIAdd(this.b),n=r.redSqrt();if(0!==n.redSqr().redSub(r).cmp(this.zero))throw new Error("invalid point");var i=n.fromRed().isOdd();return(e&&!i||!e&&i)&&(n=n.redNeg()),this.point(t,n)},c.prototype.validate=function(t){if(t.inf)return!0;var e=t.x,r=t.y,n=this.a.redMul(e),i=e.redSqr().redMul(e).redIAdd(n).redIAdd(this.b);return 0===r.redSqr().redISub(i).cmpn(0)},c.prototype._endoWnafMulAdd=function(t,e,r){for(var n=this._endoWnafT1,i=this._endoWnafT2,o=0;o<t.length;o++){var a=this._endoSplit(e[o]),f=t[o],s=f._getBeta();a.k1.negative&&(a.k1.ineg(),f=f.neg(!0)),a.k2.negative&&(a.k2.ineg(),s=s.neg(!0)),n[2*o]=f,n[2*o+1]=s,i[2*o]=a.k1,i[2*o+1]=a.k2}for(var c=this._wnafMulAdd(1,n,i,2*o,r),u=0;u<2*o;u++)n[u]=null,i[u]=null;return c},a(u,f.BasePoint),c.prototype.point=function(t,e,r){return new u(this,t,e,r)},c.prototype.pointFromJSON=function(t,e){return u.fromJSON(this,t,e)},u.prototype._getBeta=function(){if(this.curve.endo){var t=this.precomputed;if(t&&t.beta)return t.beta;var e=this.curve.point(this.x.redMul(this.curve.endo.beta),this.y);if(t){var r=this.curve,n=function(t){return r.point(t.x.redMul(r.endo.beta),t.y)};t.beta=e,e.precomputed={beta:null,naf:t.naf&&{wnd:t.naf.wnd,points:t.naf.points.map(n)},doubles:t.doubles&&{step:t.doubles.step,points:t.doubles.points.map(n)}}}return e}},u.prototype.toJSON=function(){return this.precomputed?[this.x,this.y,this.precomputed&&{doubles:this.precomputed.doubles&&{step:this.precomputed.doubles.step,points:this.precomputed.doubles.points.slice(1)},naf:this.precomputed.naf&&{wnd:this.precomputed.naf.wnd,points:this.precomputed.naf.points.slice(1)}}]:[this.x,this.y]},u.fromJSON=function(t,e,r){"string"==typeof e&&(e=JSON.parse(e));var n=t.point(e[0],e[1],r);if(!e[2])return n;function i(e){return t.point(e[0],e[1],r)}var o=e[2];return n.precomputed={beta:null,doubles:o.doubles&&{step:o.doubles.step,points:[n].concat(o.doubles.points.map(i))},naf:o.naf&&{wnd:o.naf.wnd,points:[n].concat(o.naf.points.map(i))}},n},u.prototype.inspect=function(){return this.isInfinity()?"<EC Point Infinity>":"<EC Point x: "+this.x.fromRed().toString(16,2)+" y: "+this.y.fromRed().toString(16,2)+">"},u.prototype.isInfinity=function(){return this.inf},u.prototype.add=function(t){if(this.inf)return t;if(t.inf)return this;if(this.eq(t))return this.dbl();if(this.neg().eq(t))return this.curve.point(null,null);if(0===this.x.cmp(t.x))return this.curve.point(null,null);var e=this.y.redSub(t.y);0!==e.cmpn(0)&&(e=e.redMul(this.x.redSub(t.x).redInvm()));var r=e.redSqr().redISub(this.x).redISub(t.x),n=e.redMul(this.x.redSub(r)).redISub(this.y);return this.curve.point(r,n)},u.prototype.dbl=function(){if(this.inf)return this;var t=this.y.redAdd(this.y);if(0===t.cmpn(0))return this.curve.point(null,null);var e=this.curve.a,r=this.x.redSqr(),n=t.redInvm(),i=r.redAdd(r).redIAdd(r).redIAdd(e).redMul(n),o=i.redSqr().redISub(this.x.redAdd(this.x)),a=i.redMul(this.x.redSub(o)).redISub(this.y);return this.curve.point(o,a)},u.prototype.getX=function(){return this.x.fromRed()},u.prototype.getY=function(){return this.y.fromRed()},u.prototype.mul=function(t){return t=new o(t,16),this._hasDoubles(t)?this.curve._fixedNafMul(this,t):this.curve.endo?this.curve._endoWnafMulAdd([this],[t]):this.curve._wnafMul(this,t)},u.prototype.mulAdd=function(t,e,r){var n=[this,e],i=[t,r];return this.curve.endo?this.curve._endoWnafMulAdd(n,i):this.curve._wnafMulAdd(1,n,i,2)},u.prototype.jmulAdd=function(t,e,r){var n=[this,e],i=[t,r];return this.curve.endo?this.curve._endoWnafMulAdd(n,i,!0):this.curve._wnafMulAdd(1,n,i,2,!0)},u.prototype.eq=function(t){return this===t||this.inf===t.inf&&(this.inf||0===this.x.cmp(t.x)&&0===this.y.cmp(t.y))},u.prototype.neg=function(t){if(this.inf)return this;var e=this.curve.point(this.x,this.y.redNeg());if(t&&this.precomputed){var r=this.precomputed,n=function(t){return t.neg()};e.precomputed={naf:r.naf&&{wnd:r.naf.wnd,points:r.naf.points.map(n)},doubles:r.doubles&&{step:r.doubles.step,points:r.doubles.points.map(n)}}}return e},u.prototype.toJ=function(){return this.inf?this.curve.jpoint(null,null,null):this.curve.jpoint(this.x,this.y,this.curve.one)},a(h,f.BasePoint),c.prototype.jpoint=function(t,e,r){return new h(this,t,e,r)},h.prototype.toP=function(){if(this.isInfinity())return this.curve.point(null,null);var t=this.z.redInvm(),e=t.redSqr(),r=this.x.redMul(e),n=this.y.redMul(e).redMul(t);return this.curve.point(r,n)},h.prototype.neg=function(){return this.curve.jpoint(this.x,this.y.redNeg(),this.z)},h.prototype.add=function(t){if(this.isInfinity())return t;if(t.isInfinity())return this;var e=t.z.redSqr(),r=this.z.redSqr(),n=this.x.redMul(e),i=t.x.redMul(r),o=this.y.redMul(e.redMul(t.z)),a=t.y.redMul(r.redMul(this.z)),f=n.redSub(i),s=o.redSub(a);if(0===f.cmpn(0))return 0!==s.cmpn(0)?this.curve.jpoint(null,null,null):this.dbl();var c=f.redSqr(),u=c.redMul(f),h=n.redMul(c),d=s.redSqr().redIAdd(u).redISub(h).redISub(h),l=s.redMul(h.redISub(d)).redISub(o.redMul(u)),p=this.z.redMul(t.z).redMul(f);return this.curve.jpoint(d,l,p)},h.prototype.mixedAdd=function(t){if(this.isInfinity())return t.toJ();if(t.isInfinity())return this;var e=this.z.redSqr(),r=this.x,n=t.x.redMul(e),i=this.y,o=t.y.redMul(e).redMul(this.z),a=r.redSub(n),f=i.redSub(o);if(0===a.cmpn(0))return 0!==f.cmpn(0)?this.curve.jpoint(null,null,null):this.dbl();var s=a.redSqr(),c=s.redMul(a),u=r.redMul(s),h=f.redSqr().redIAdd(c).redISub(u).redISub(u),d=f.redMul(u.redISub(h)).redISub(i.redMul(c)),l=this.z.redMul(a);return this.curve.jpoint(h,d,l)},h.prototype.dblp=function(t){if(0===t)return this;if(this.isInfinity())return this;if(!t)return this.dbl();if(this.curve.zeroA||this.curve.threeA){for(var e=this,r=0;r<t;r++)e=e.dbl();return e}var n=this.curve.a,i=this.curve.tinv,o=this.x,a=this.y,f=this.z,s=f.redSqr().redSqr(),c=a.redAdd(a);for(r=0;r<t;r++){var u=o.redSqr(),h=c.redSqr(),d=h.redSqr(),l=u.redAdd(u).redIAdd(u).redIAdd(n.redMul(s)),p=o.redMul(h),b=l.redSqr().redISub(p.redAdd(p)),y=p.redISub(b),v=l.redMul(y);v=v.redIAdd(v).redISub(d);var g=c.redMul(f);r+1<t&&(s=s.redMul(d)),o=b,f=g,c=v}return this.curve.jpoint(o,c.redMul(i),f)},h.prototype.dbl=function(){return this.isInfinity()?this:this.curve.zeroA?this._zeroDbl():this.curve.threeA?this._threeDbl():this._dbl()},h.prototype._zeroDbl=function(){var t,e,r;if(this.zOne){var n=this.x.redSqr(),i=this.y.redSqr(),o=i.redSqr(),a=this.x.redAdd(i).redSqr().redISub(n).redISub(o);a=a.redIAdd(a);var f=n.redAdd(n).redIAdd(n),s=f.redSqr().redISub(a).redISub(a),c=o.redIAdd(o);c=(c=c.redIAdd(c)).redIAdd(c),t=s,e=f.redMul(a.redISub(s)).redISub(c),r=this.y.redAdd(this.y)}else{var u=this.x.redSqr(),h=this.y.redSqr(),d=h.redSqr(),l=this.x.redAdd(h).redSqr().redISub(u).redISub(d);l=l.redIAdd(l);var p=u.redAdd(u).redIAdd(u),b=p.redSqr(),y=d.redIAdd(d);y=(y=y.redIAdd(y)).redIAdd(y),t=b.redISub(l).redISub(l),e=p.redMul(l.redISub(t)).redISub(y),r=(r=this.y.redMul(this.z)).redIAdd(r)}return this.curve.jpoint(t,e,r)},h.prototype._threeDbl=function(){var t,e,r;if(this.zOne){var n=this.x.redSqr(),i=this.y.redSqr(),o=i.redSqr(),a=this.x.redAdd(i).redSqr().redISub(n).redISub(o);a=a.redIAdd(a);var f=n.redAdd(n).redIAdd(n).redIAdd(this.curve.a),s=f.redSqr().redISub(a).redISub(a);t=s;var c=o.redIAdd(o);c=(c=c.redIAdd(c)).redIAdd(c),e=f.redMul(a.redISub(s)).redISub(c),r=this.y.redAdd(this.y)}else{var u=this.z.redSqr(),h=this.y.redSqr(),d=this.x.redMul(h),l=this.x.redSub(u).redMul(this.x.redAdd(u));l=l.redAdd(l).redIAdd(l);var p=d.redIAdd(d),b=(p=p.redIAdd(p)).redAdd(p);t=l.redSqr().redISub(b),r=this.y.redAdd(this.z).redSqr().redISub(h).redISub(u);var y=h.redSqr();y=(y=(y=y.redIAdd(y)).redIAdd(y)).redIAdd(y),e=l.redMul(p.redISub(t)).redISub(y)}return this.curve.jpoint(t,e,r)},h.prototype._dbl=function(){var t=this.curve.a,e=this.x,r=this.y,n=this.z,i=n.redSqr().redSqr(),o=e.redSqr(),a=r.redSqr(),f=o.redAdd(o).redIAdd(o).redIAdd(t.redMul(i)),s=e.redAdd(e),c=(s=s.redIAdd(s)).redMul(a),u=f.redSqr().redISub(c.redAdd(c)),h=c.redISub(u),d=a.redSqr();d=(d=(d=d.redIAdd(d)).redIAdd(d)).redIAdd(d);var l=f.redMul(h).redISub(d),p=r.redAdd(r).redMul(n);return this.curve.jpoint(u,l,p)},h.prototype.trpl=function(){if(!this.curve.zeroA)return this.dbl().add(this);var t=this.x.redSqr(),e=this.y.redSqr(),r=this.z.redSqr(),n=e.redSqr(),i=t.redAdd(t).redIAdd(t),o=i.redSqr(),a=this.x.redAdd(e).redSqr().redISub(t).redISub(n),f=(a=(a=(a=a.redIAdd(a)).redAdd(a).redIAdd(a)).redISub(o)).redSqr(),s=n.redIAdd(n);s=(s=(s=s.redIAdd(s)).redIAdd(s)).redIAdd(s);var c=i.redIAdd(a).redSqr().redISub(o).redISub(f).redISub(s),u=e.redMul(c);u=(u=u.redIAdd(u)).redIAdd(u);var h=this.x.redMul(f).redISub(u);h=(h=h.redIAdd(h)).redIAdd(h);var d=this.y.redMul(c.redMul(s.redISub(c)).redISub(a.redMul(f)));d=(d=(d=d.redIAdd(d)).redIAdd(d)).redIAdd(d);var l=this.z.redAdd(a).redSqr().redISub(r).redISub(f);return this.curve.jpoint(h,d,l)},h.prototype.mul=function(t,e){return t=new o(t,e),this.curve._wnafMul(this,t)},h.prototype.eq=function(t){if("affine"===t.type)return this.eq(t.toJ());if(this===t)return!0;var e=this.z.redSqr(),r=t.z.redSqr();if(0!==this.x.redMul(r).redISub(t.x.redMul(e)).cmpn(0))return!1;var n=e.redMul(this.z),i=r.redMul(t.z);return 0===this.y.redMul(i).redISub(t.y.redMul(n)).cmpn(0)},h.prototype.eqXToP=function(t){var e=this.z.redSqr(),r=t.toRed(this.curve.red).redMul(e);if(0===this.x.cmp(r))return!0;for(var n=t.clone(),i=this.curve.redN.redMul(e);;){if(n.iadd(this.curve.n),n.cmp(this.curve.p)>=0)return!1;if(r.redIAdd(i),0===this.x.cmp(r))return!0}},h.prototype.inspect=function(){return this.isInfinity()?"<EC JPoint Infinity>":"<EC JPoint x: "+this.x.toString(16,2)+" y: "+this.y.toString(16,2)+" z: "+this.z.toString(16,2)+">"},h.prototype.isInfinity=function(){return 0===this.z.cmpn(0)}},function(t,e,r){"use strict";var n=r(18),i=r(3),o=r(0),a=n.base,f=r(2).utils;function s(t){a.call(this,"mont",t),this.a=new i(t.a,16).toRed(this.red),this.b=new i(t.b,16).toRed(this.red),this.i4=new i(4).toRed(this.red).redInvm(),this.two=new i(2).toRed(this.red),this.a24=this.i4.redMul(this.a.redAdd(this.two))}function c(t,e,r){a.BasePoint.call(this,t,"projective"),null===e&&null===r?(this.x=this.curve.one,this.z=this.curve.zero):(this.x=new i(e,16),this.z=new i(r,16),this.x.red||(this.x=this.x.toRed(this.curve.red)),this.z.red||(this.z=this.z.toRed(this.curve.red)))}o(s,a),t.exports=s,s.prototype.validate=function(t){var e=t.normalize().x,r=e.redSqr(),n=r.redMul(e).redAdd(r.redMul(this.a)).redAdd(e);return 0===n.redSqrt().redSqr().cmp(n)},o(c,a.BasePoint),s.prototype.decodePoint=function(t,e){return this.point(f.toArray(t,e),1)},s.prototype.point=function(t,e){return new c(this,t,e)},s.prototype.pointFromJSON=function(t){return c.fromJSON(this,t)},c.prototype.precompute=function(){},c.prototype._encode=function(){return this.getX().toArray("be",this.curve.p.byteLength())},c.fromJSON=function(t,e){return new c(t,e[0],e[1]||t.one)},c.prototype.inspect=function(){return this.isInfinity()?"<EC Point Infinity>":"<EC Point x: "+this.x.fromRed().toString(16,2)+" z: "+this.z.fromRed().toString(16,2)+">"},c.prototype.isInfinity=function(){return 0===this.z.cmpn(0)},c.prototype.dbl=function(){var t=this.x.redAdd(this.z).redSqr(),e=this.x.redSub(this.z).redSqr(),r=t.redSub(e),n=t.redMul(e),i=r.redMul(e.redAdd(this.curve.a24.redMul(r)));return this.curve.point(n,i)},c.prototype.add=function(){throw new Error("Not supported on Montgomery curve")},c.prototype.diffAdd=function(t,e){var r=this.x.redAdd(this.z),n=this.x.redSub(this.z),i=t.x.redAdd(t.z),o=t.x.redSub(t.z).redMul(r),a=i.redMul(n),f=e.z.redMul(o.redAdd(a).redSqr()),s=e.x.redMul(o.redISub(a).redSqr());return this.curve.point(f,s)},c.prototype.mul=function(t){for(var e=t.clone(),r=this,n=this.curve.point(null,null),i=[];0!==e.cmpn(0);e.iushrn(1))i.push(e.andln(1));for(var o=i.length-1;o>=0;o--)0===i[o]?(r=r.diffAdd(n,this),n=n.dbl()):(n=r.diffAdd(n,this),r=r.dbl());return n},c.prototype.mulAdd=function(){throw new Error("Not supported on Montgomery curve")},c.prototype.jumlAdd=function(){throw new Error("Not supported on Montgomery curve")},c.prototype.eq=function(t){return 0===this.getX().cmp(t.getX())},c.prototype.normalize=function(){return this.x=this.x.redMul(this.z.redInvm()),this.z=this.curve.one,this},c.prototype.getX=function(){return this.normalize(),this.x.fromRed()}},function(t,e,r){"use strict";var n=r(18),i=r(2),o=r(3),a=r(0),f=n.base,s=i.utils.assert;function c(t){this.twisted=1!=(0|t.a),this.mOneA=this.twisted&&-1==(0|t.a),this.extended=this.mOneA,f.call(this,"edwards",t),this.a=new o(t.a,16).umod(this.red.m),this.a=this.a.toRed(this.red),this.c=new o(t.c,16).toRed(this.red),this.c2=this.c.redSqr(),this.d=new o(t.d,16).toRed(this.red),this.dd=this.d.redAdd(this.d),s(!this.twisted||0===this.c.fromRed().cmpn(1)),this.oneC=1==(0|t.c)}function u(t,e,r,n,i){f.BasePoint.call(this,t,"projective"),null===e&&null===r&&null===n?(this.x=this.curve.zero,this.y=this.curve.one,this.z=this.curve.one,this.t=this.curve.zero,this.zOne=!0):(this.x=new o(e,16),this.y=new o(r,16),this.z=n?new o(n,16):this.curve.one,this.t=i&&new o(i,16),this.x.red||(this.x=this.x.toRed(this.curve.red)),this.y.red||(this.y=this.y.toRed(this.curve.red)),this.z.red||(this.z=this.z.toRed(this.curve.red)),this.t&&!this.t.red&&(this.t=this.t.toRed(this.curve.red)),this.zOne=this.z===this.curve.one,this.curve.extended&&!this.t&&(this.t=this.x.redMul(this.y),this.zOne||(this.t=this.t.redMul(this.z.redInvm()))))}a(c,f),t.exports=c,c.prototype._mulA=function(t){return this.mOneA?t.redNeg():this.a.redMul(t)},c.prototype._mulC=function(t){return this.oneC?t:this.c.redMul(t)},c.prototype.jpoint=function(t,e,r,n){return this.point(t,e,r,n)},c.prototype.pointFromX=function(t,e){(t=new o(t,16)).red||(t=t.toRed(this.red));var r=t.redSqr(),n=this.c2.redSub(this.a.redMul(r)),i=this.one.redSub(this.c2.redMul(this.d).redMul(r)),a=n.redMul(i.redInvm()),f=a.redSqrt();if(0!==f.redSqr().redSub(a).cmp(this.zero))throw new Error("invalid point");var s=f.fromRed().isOdd();return(e&&!s||!e&&s)&&(f=f.redNeg()),this.point(t,f)},c.prototype.pointFromY=function(t,e){(t=new o(t,16)).red||(t=t.toRed(this.red));var r=t.redSqr(),n=r.redSub(this.c2),i=r.redMul(this.d).redMul(this.c2).redSub(this.a),a=n.redMul(i.redInvm());if(0===a.cmp(this.zero)){if(e)throw new Error("invalid point");return this.point(this.zero,t)}var f=a.redSqrt();if(0!==f.redSqr().redSub(a).cmp(this.zero))throw new Error("invalid point");return f.fromRed().isOdd()!==e&&(f=f.redNeg()),this.point(f,t)},c.prototype.validate=function(t){if(t.isInfinity())return!0;t.normalize();var e=t.x.redSqr(),r=t.y.redSqr(),n=e.redMul(this.a).redAdd(r),i=this.c2.redMul(this.one.redAdd(this.d.redMul(e).redMul(r)));return 0===n.cmp(i)},a(u,f.BasePoint),c.prototype.pointFromJSON=function(t){return u.fromJSON(this,t)},c.prototype.point=function(t,e,r,n){return new u(this,t,e,r,n)},u.fromJSON=function(t,e){return new u(t,e[0],e[1],e[2])},u.prototype.inspect=function(){return this.isInfinity()?"<EC Point Infinity>":"<EC Point x: "+this.x.fromRed().toString(16,2)+" y: "+this.y.fromRed().toString(16,2)+" z: "+this.z.fromRed().toString(16,2)+">"},u.prototype.isInfinity=function(){return 0===this.x.cmpn(0)&&(0===this.y.cmp(this.z)||this.zOne&&0===this.y.cmp(this.curve.c))},u.prototype._extDbl=function(){var t=this.x.redSqr(),e=this.y.redSqr(),r=this.z.redSqr();r=r.redIAdd(r);var n=this.curve._mulA(t),i=this.x.redAdd(this.y).redSqr().redISub(t).redISub(e),o=n.redAdd(e),a=o.redSub(r),f=n.redSub(e),s=i.redMul(a),c=o.redMul(f),u=i.redMul(f),h=a.redMul(o);return this.curve.point(s,c,h,u)},u.prototype._projDbl=function(){var t,e,r,n=this.x.redAdd(this.y).redSqr(),i=this.x.redSqr(),o=this.y.redSqr();if(this.curve.twisted){var a=(c=this.curve._mulA(i)).redAdd(o);if(this.zOne)t=n.redSub(i).redSub(o).redMul(a.redSub(this.curve.two)),e=a.redMul(c.redSub(o)),r=a.redSqr().redSub(a).redSub(a);else{var f=this.z.redSqr(),s=a.redSub(f).redISub(f);t=n.redSub(i).redISub(o).redMul(s),e=a.redMul(c.redSub(o)),r=a.redMul(s)}}else{var c=i.redAdd(o);f=this.curve._mulC(this.z).redSqr(),s=c.redSub(f).redSub(f);t=this.curve._mulC(n.redISub(c)).redMul(s),e=this.curve._mulC(c).redMul(i.redISub(o)),r=c.redMul(s)}return this.curve.point(t,e,r)},u.prototype.dbl=function(){return this.isInfinity()?this:this.curve.extended?this._extDbl():this._projDbl()},u.prototype._extAdd=function(t){var e=this.y.redSub(this.x).redMul(t.y.redSub(t.x)),r=this.y.redAdd(this.x).redMul(t.y.redAdd(t.x)),n=this.t.redMul(this.curve.dd).redMul(t.t),i=this.z.redMul(t.z.redAdd(t.z)),o=r.redSub(e),a=i.redSub(n),f=i.redAdd(n),s=r.redAdd(e),c=o.redMul(a),u=f.redMul(s),h=o.redMul(s),d=a.redMul(f);return this.curve.point(c,u,d,h)},u.prototype._projAdd=function(t){var e,r,n=this.z.redMul(t.z),i=n.redSqr(),o=this.x.redMul(t.x),a=this.y.redMul(t.y),f=this.curve.d.redMul(o).redMul(a),s=i.redSub(f),c=i.redAdd(f),u=this.x.redAdd(this.y).redMul(t.x.redAdd(t.y)).redISub(o).redISub(a),h=n.redMul(s).redMul(u);return this.curve.twisted?(e=n.redMul(c).redMul(a.redSub(this.curve._mulA(o))),r=s.redMul(c)):(e=n.redMul(c).redMul(a.redSub(o)),r=this.curve._mulC(s).redMul(c)),this.curve.point(h,e,r)},u.prototype.add=function(t){return this.isInfinity()?t:t.isInfinity()?this:this.curve.extended?this._extAdd(t):this._projAdd(t)},u.prototype.mul=function(t){return this._hasDoubles(t)?this.curve._fixedNafMul(this,t):this.curve._wnafMul(this,t)},u.prototype.mulAdd=function(t,e,r){return this.curve._wnafMulAdd(1,[this,e],[t,r],2,!1)},u.prototype.jmulAdd=function(t,e,r){return this.curve._wnafMulAdd(1,[this,e],[t,r],2,!0)},u.prototype.normalize=function(){if(this.zOne)return this;var t=this.z.redInvm();return this.x=this.x.redMul(t),this.y=this.y.redMul(t),this.t&&(this.t=this.t.redMul(t)),this.z=this.curve.one,this.zOne=!0,this},u.prototype.neg=function(){return this.curve.point(this.x.redNeg(),this.y,this.z,this.t&&this.t.redNeg())},u.prototype.getX=function(){return this.normalize(),this.x.fromRed()},u.prototype.getY=function(){return this.normalize(),this.y.fromRed()},u.prototype.eq=function(t){return this===t||0===this.getX().cmp(t.getX())&&0===this.getY().cmp(t.getY())},u.prototype.eqXToP=function(t){var e=t.toRed(this.curve.red).redMul(this.z);if(0===this.x.cmp(e))return!0;for(var r=t.clone(),n=this.curve.redN.redMul(this.z);;){if(r.iadd(this.curve.n),r.cmp(this.curve.p)>=0)return!1;if(e.redIAdd(n),0===this.x.cmp(e))return!0}},u.prototype.toP=u.prototype.normalize,u.prototype.mixedAdd=u.prototype.add},function(t,e,r){"use strict";var n,i=e,o=r(23),a=r(2),f=a.utils.assert;function s(t){"short"===t.type?this.curve=new a.curve.short(t):"edwards"===t.type?this.curve=new a.curve.edwards(t):this.curve=new a.curve.mont(t),this.g=this.curve.g,this.n=this.curve.n,this.hash=t.hash,f(this.g.validate(),"Invalid curve"),f(this.g.mul(this.n).isInfinity(),"Invalid curve, G*N != O")}function c(t,e){Object.defineProperty(i,t,{configurable:!0,enumerable:!0,get:function(){var r=new s(e);return Object.defineProperty(i,t,{configurable:!0,enumerable:!0,value:r}),r}})}i.PresetCurve=s,c("p192",{type:"short",prime:"p192",p:"ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff",a:"ffffffff ffffffff ffffffff fffffffe ffffffff fffffffc",b:"64210519 e59c80e7 0fa7e9ab 72243049 feb8deec c146b9b1",n:"ffffffff ffffffff ffffffff 99def836 146bc9b1 b4d22831",hash:o.sha256,gRed:!1,g:["188da80e b03090f6 7cbf20eb 43a18800 f4ff0afd 82ff1012","07192b95 ffc8da78 631011ed 6b24cdd5 73f977a1 1e794811"]}),c("p224",{type:"short",prime:"p224",p:"ffffffff ffffffff ffffffff ffffffff 00000000 00000000 00000001",a:"ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff fffffffe",b:"b4050a85 0c04b3ab f5413256 5044b0b7 d7bfd8ba 270b3943 2355ffb4",n:"ffffffff ffffffff ffffffff ffff16a2 e0b8f03e 13dd2945 5c5c2a3d",hash:o.sha256,gRed:!1,g:["b70e0cbd 6bb4bf7f 321390b9 4a03c1d3 56c21122 343280d6 115c1d21","bd376388 b5f723fb 4c22dfe6 cd4375a0 5a074764 44d58199 85007e34"]}),c("p256",{type:"short",prime:null,p:"ffffffff 00000001 00000000 00000000 00000000 ffffffff ffffffff ffffffff",a:"ffffffff 00000001 00000000 00000000 00000000 ffffffff ffffffff fffffffc",b:"5ac635d8 aa3a93e7 b3ebbd55 769886bc 651d06b0 cc53b0f6 3bce3c3e 27d2604b",n:"ffffffff 00000000 ffffffff ffffffff bce6faad a7179e84 f3b9cac2 fc632551",hash:o.sha256,gRed:!1,g:["6b17d1f2 e12c4247 f8bce6e5 63a440f2 77037d81 2deb33a0 f4a13945 d898c296","4fe342e2 fe1a7f9b 8ee7eb4a 7c0f9e16 2bce3357 6b315ece cbb64068 37bf51f5"]}),c("p384",{type:"short",prime:null,p:"ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe ffffffff 00000000 00000000 ffffffff",a:"ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe ffffffff 00000000 00000000 fffffffc",b:"b3312fa7 e23ee7e4 988e056b e3f82d19 181d9c6e fe814112 0314088f 5013875a c656398d 8a2ed19d 2a85c8ed d3ec2aef",n:"ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff c7634d81 f4372ddf 581a0db2 48b0a77a ecec196a ccc52973",hash:o.sha384,gRed:!1,g:["aa87ca22 be8b0537 8eb1c71e f320ad74 6e1d3b62 8ba79b98 59f741e0 82542a38 5502f25d bf55296c 3a545e38 72760ab7","3617de4a 96262c6f 5d9e98bf 9292dc29 f8f41dbd 289a147c e9da3113 b5f0b8c0 0a60b1ce 1d7e819d 7a431d7c 90ea0e5f"]}),c("p521",{type:"short",prime:null,p:"000001ff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff",a:"000001ff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffc",b:"00000051 953eb961 8e1c9a1f 929a21a0 b68540ee a2da725b 99b315f3 b8b48991 8ef109e1 56193951 ec7e937b 1652c0bd 3bb1bf07 3573df88 3d2c34f1 ef451fd4 6b503f00",n:"000001ff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffa 51868783 bf2f966b 7fcc0148 f709a5d0 3bb5c9b8 899c47ae bb6fb71e 91386409",hash:o.sha512,gRed:!1,g:["000000c6 858e06b7 0404e9cd 9e3ecb66 2395b442 9c648139 053fb521 f828af60 6b4d3dba a14b5e77 efe75928 fe1dc127 a2ffa8de 3348b3c1 856a429b f97e7e31 c2e5bd66","00000118 39296a78 9a3bc004 5c8a5fb4 2c7d1bd9 98f54449 579b4468 17afbd17 273e662c 97ee7299 5ef42640 c550b901 3fad0761 353c7086 a272c240 88be9476 9fd16650"]}),c("curve25519",{type:"mont",prime:"p25519",p:"7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed",a:"76d06",b:"1",n:"1000000000000000 0000000000000000 14def9dea2f79cd6 5812631a5cf5d3ed",hash:o.sha256,gRed:!1,g:["9"]}),c("ed25519",{type:"edwards",prime:"p25519",p:"7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed",a:"-1",c:"1",d:"52036cee2b6ffe73 8cc740797779e898 00700a4d4141d8ab 75eb4dca135978a3",n:"1000000000000000 0000000000000000 14def9dea2f79cd6 5812631a5cf5d3ed",hash:o.sha256,gRed:!1,g:["216936d3cd6e53fec0a4e231fdd6dc5c692cc7609525a7b2c9562d608f25d51a","6666666666666666666666666666666666666666666666666666666666666658"]});try{n=r(114)}catch(t){n=void 0}c("secp256k1",{type:"short",prime:"k256",p:"ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2f",a:"0",b:"7",n:"ffffffff ffffffff ffffffff fffffffe baaedce6 af48a03b bfd25e8c d0364141",h:"1",hash:o.sha256,beta:"7ae96a2b657c07106e64479eac3434e99cf0497512f58995c1396c28719501ee",lambda:"5363ad4cc05c30e0a5261c028812645a122e22ea20816678df02967c1b23bd72",basis:[{a:"3086d221a7d46bcde86c90e49284eb15",b:"-e4437ed6010e88286f547fa90abfe4c3"},{a:"114ca50f7a8e2f3f657c1108d9d44cfd8",b:"3086d221a7d46bcde86c90e49284eb15"}],gRed:!1,g:["79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798","483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8",n]})},function(t,e,r){"use strict";e.sha1=r(109),e.sha224=r(110),e.sha256=r(43),e.sha384=r(111),e.sha512=r(44)},function(t,e,r){"use strict";var n=r(5),i=r(13),o=r(42),a=n.rotl32,f=n.sum32,s=n.sum32_5,c=o.ft_1,u=i.BlockHash,h=[1518500249,1859775393,2400959708,3395469782];function d(){if(!(this instanceof d))return new d;u.call(this),this.h=[1732584193,4023233417,2562383102,271733878,3285377520],this.W=new Array(80)}n.inherits(d,u),t.exports=d,d.blockSize=512,d.outSize=160,d.hmacStrength=80,d.padLength=64,d.prototype._update=function(t,e){for(var r=this.W,n=0;n<16;n++)r[n]=t[e+n];for(;n<r.length;n++)r[n]=a(r[n-3]^r[n-8]^r[n-14]^r[n-16],1);var i=this.h[0],o=this.h[1],u=this.h[2],d=this.h[3],l=this.h[4];for(n=0;n<r.length;n++){var p=~~(n/20),b=s(a(i,5),c(p,o,u,d),l,r[n],h[p]);l=d,d=u,u=a(o,30),o=i,i=b}this.h[0]=f(this.h[0],i),this.h[1]=f(this.h[1],o),this.h[2]=f(this.h[2],u),this.h[3]=f(this.h[3],d),this.h[4]=f(this.h[4],l)},d.prototype._digest=function(t){return"hex"===t?n.toHex32(this.h,"big"):n.split32(this.h,"big")}},function(t,e,r){"use strict";var n=r(5),i=r(43);function o(){if(!(this instanceof o))return new o;i.call(this),this.h=[3238371032,914150663,812702999,4144912697,4290775857,1750603025,1694076839,3204075428]}n.inherits(o,i),t.exports=o,o.blockSize=512,o.outSize=224,o.hmacStrength=192,o.padLength=64,o.prototype._digest=function(t){return"hex"===t?n.toHex32(this.h.slice(0,7),"big"):n.split32(this.h.slice(0,7),"big")}},function(t,e,r){"use strict";var n=r(5),i=r(44);function o(){if(!(this instanceof o))return new o;i.call(this),this.h=[3418070365,3238371032,1654270250,914150663,2438529370,812702999,355462360,4144912697,1731405415,4290775857,2394180231,1750603025,3675008525,1694076839,1203062813,3204075428]}n.inherits(o,i),t.exports=o,o.blockSize=1024,o.outSize=384,o.hmacStrength=192,o.padLength=128,o.prototype._digest=function(t){return"hex"===t?n.toHex32(this.h.slice(0,12),"big"):n.split32(this.h.slice(0,12),"big")}},function(t,e,r){"use strict";var n=r(5),i=r(13),o=n.rotl32,a=n.sum32,f=n.sum32_3,s=n.sum32_4,c=i.BlockHash;function u(){if(!(this instanceof u))return new u;c.call(this),this.h=[1732584193,4023233417,2562383102,271733878,3285377520],this.endian="little"}function h(t,e,r,n){return t<=15?e^r^n:t<=31?e&r|~e&n:t<=47?(e|~r)^n:t<=63?e&n|r&~n:e^(r|~n)}function d(t){return t<=15?0:t<=31?1518500249:t<=47?1859775393:t<=63?2400959708:2840853838}function l(t){return t<=15?1352829926:t<=31?1548603684:t<=47?1836072691:t<=63?2053994217:0}n.inherits(u,c),e.ripemd160=u,u.blockSize=512,u.outSize=160,u.hmacStrength=192,u.padLength=64,u.prototype._update=function(t,e){for(var r=this.h[0],n=this.h[1],i=this.h[2],c=this.h[3],u=this.h[4],g=r,m=n,_=i,w=c,S=u,E=0;E<80;E++){var M=a(o(s(r,h(E,n,i,c),t[p[E]+e],d(E)),y[E]),u);r=u,u=c,c=o(i,10),i=n,n=M,M=a(o(s(g,h(79-E,m,_,w),t[b[E]+e],l(E)),v[E]),S),g=S,S=w,w=o(_,10),_=m,m=M}M=f(this.h[1],i,w),this.h[1]=f(this.h[2],c,S),this.h[2]=f(this.h[3],u,g),this.h[3]=f(this.h[4],r,m),this.h[4]=f(this.h[0],n,_),this.h[0]=M},u.prototype._digest=function(t){return"hex"===t?n.toHex32(this.h,"little"):n.split32(this.h,"little")};var p=[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,7,4,13,1,10,6,15,3,12,0,9,5,2,14,11,8,3,10,14,4,9,15,8,1,2,7,0,6,13,11,5,12,1,9,11,10,0,8,12,4,13,3,7,15,14,5,6,2,4,0,5,9,7,12,2,10,14,1,3,8,11,6,15,13],b=[5,14,7,0,9,2,11,4,13,6,15,8,1,10,3,12,6,11,3,7,0,13,5,10,14,15,8,12,4,9,1,2,15,5,1,3,7,14,6,9,11,8,12,2,10,0,4,13,8,6,4,1,3,11,15,0,5,12,2,13,9,7,10,14,12,15,10,4,1,5,8,7,6,2,13,14,0,3,9,11],y=[11,14,15,12,5,8,7,9,11,13,14,15,6,7,9,8,7,6,8,13,11,9,7,15,7,12,15,9,11,7,13,12,11,13,6,7,14,9,13,15,14,8,13,6,5,12,7,5,11,12,14,15,14,15,9,8,9,14,5,6,8,6,5,12,9,15,5,11,6,8,13,12,5,12,13,14,11,8,5,6],v=[8,9,9,11,13,15,15,5,7,7,8,11,14,14,12,6,9,13,15,7,12,8,9,11,7,7,12,7,6,15,13,11,9,7,15,11,8,6,6,14,12,13,5,14,13,13,7,5,15,5,8,11,14,14,6,14,6,9,12,9,12,5,15,8,8,5,12,9,12,5,14,6,8,13,6,5,15,13,11,11]},function(t,e,r){"use strict";var n=r(5),i=r(8);function o(t,e,r){if(!(this instanceof o))return new o(t,e,r);this.Hash=t,this.blockSize=t.blockSize/8,this.outSize=t.outSize/8,this.inner=null,this.outer=null,this._init(n.toArray(e,r))}t.exports=o,o.prototype._init=function(t){t.length>this.blockSize&&(t=(new this.Hash).update(t).digest()),i(t.length<=this.blockSize);for(var e=t.length;e<this.blockSize;e++)t.push(0);for(e=0;e<t.length;e++)t[e]^=54;for(this.inner=(new this.Hash).update(t),e=0;e<t.length;e++)t[e]^=106;this.outer=(new this.Hash).update(t)},o.prototype.update=function(t,e){return this.inner.update(t,e),this},o.prototype.digest=function(t){return this.outer.update(this.inner.digest()),this.outer.digest(t)}},function(t,e){t.exports={doubles:{step:4,points:[["e60fce93b59e9ec53011aabc21c23e97b2a31369b87a5ae9c44ee89e2a6dec0a","f7e3507399e595929db99f34f57937101296891e44d23f0be1f32cce69616821"],["8282263212c609d9ea2a6e3e172de238d8c39cabd5ac1ca10646e23fd5f51508","11f8a8098557dfe45e8256e830b60ace62d613ac2f7b17bed31b6eaff6e26caf"],["175e159f728b865a72f99cc6c6fc846de0b93833fd2222ed73fce5b551e5b739","d3506e0d9e3c79eba4ef97a51ff71f5eacb5955add24345c6efa6ffee9fed695"],["363d90d447b00c9c99ceac05b6262ee053441c7e55552ffe526bad8f83ff4640","4e273adfc732221953b445397f3363145b9a89008199ecb62003c7f3bee9de9"],["8b4b5f165df3c2be8c6244b5b745638843e4a781a15bcd1b69f79a55dffdf80c","4aad0a6f68d308b4b3fbd7813ab0da04f9e336546162ee56b3eff0c65fd4fd36"],["723cbaa6e5db996d6bf771c00bd548c7b700dbffa6c0e77bcb6115925232fcda","96e867b5595cc498a921137488824d6e2660a0653779494801dc069d9eb39f5f"],["eebfa4d493bebf98ba5feec812c2d3b50947961237a919839a533eca0e7dd7fa","5d9a8ca3970ef0f269ee7edaf178089d9ae4cdc3a711f712ddfd4fdae1de8999"],["100f44da696e71672791d0a09b7bde459f1215a29b3c03bfefd7835b39a48db0","cdd9e13192a00b772ec8f3300c090666b7ff4a18ff5195ac0fbd5cd62bc65a09"],["e1031be262c7ed1b1dc9227a4a04c017a77f8d4464f3b3852c8acde6e534fd2d","9d7061928940405e6bb6a4176597535af292dd419e1ced79a44f18f29456a00d"],["feea6cae46d55b530ac2839f143bd7ec5cf8b266a41d6af52d5e688d9094696d","e57c6b6c97dce1bab06e4e12bf3ecd5c981c8957cc41442d3155debf18090088"],["da67a91d91049cdcb367be4be6ffca3cfeed657d808583de33fa978bc1ec6cb1","9bacaa35481642bc41f463f7ec9780e5dec7adc508f740a17e9ea8e27a68be1d"],["53904faa0b334cdda6e000935ef22151ec08d0f7bb11069f57545ccc1a37b7c0","5bc087d0bc80106d88c9eccac20d3c1c13999981e14434699dcb096b022771c8"],["8e7bcd0bd35983a7719cca7764ca906779b53a043a9b8bcaeff959f43ad86047","10b7770b2a3da4b3940310420ca9514579e88e2e47fd68b3ea10047e8460372a"],["385eed34c1cdff21e6d0818689b81bde71a7f4f18397e6690a841e1599c43862","283bebc3e8ea23f56701de19e9ebf4576b304eec2086dc8cc0458fe5542e5453"],["6f9d9b803ecf191637c73a4413dfa180fddf84a5947fbc9c606ed86c3fac3a7","7c80c68e603059ba69b8e2a30e45c4d47ea4dd2f5c281002d86890603a842160"],["3322d401243c4e2582a2147c104d6ecbf774d163db0f5e5313b7e0e742d0e6bd","56e70797e9664ef5bfb019bc4ddaf9b72805f63ea2873af624f3a2e96c28b2a0"],["85672c7d2de0b7da2bd1770d89665868741b3f9af7643397721d74d28134ab83","7c481b9b5b43b2eb6374049bfa62c2e5e77f17fcc5298f44c8e3094f790313a6"],["948bf809b1988a46b06c9f1919413b10f9226c60f668832ffd959af60c82a0a","53a562856dcb6646dc6b74c5d1c3418c6d4dff08c97cd2bed4cb7f88d8c8e589"],["6260ce7f461801c34f067ce0f02873a8f1b0e44dfc69752accecd819f38fd8e8","bc2da82b6fa5b571a7f09049776a1ef7ecd292238051c198c1a84e95b2b4ae17"],["e5037de0afc1d8d43d8348414bbf4103043ec8f575bfdc432953cc8d2037fa2d","4571534baa94d3b5f9f98d09fb990bddbd5f5b03ec481f10e0e5dc841d755bda"],["e06372b0f4a207adf5ea905e8f1771b4e7e8dbd1c6a6c5b725866a0ae4fce725","7a908974bce18cfe12a27bb2ad5a488cd7484a7787104870b27034f94eee31dd"],["213c7a715cd5d45358d0bbf9dc0ce02204b10bdde2a3f58540ad6908d0559754","4b6dad0b5ae462507013ad06245ba190bb4850f5f36a7eeddff2c27534b458f2"],["4e7c272a7af4b34e8dbb9352a5419a87e2838c70adc62cddf0cc3a3b08fbd53c","17749c766c9d0b18e16fd09f6def681b530b9614bff7dd33e0b3941817dcaae6"],["fea74e3dbe778b1b10f238ad61686aa5c76e3db2be43057632427e2840fb27b6","6e0568db9b0b13297cf674deccb6af93126b596b973f7b77701d3db7f23cb96f"],["76e64113f677cf0e10a2570d599968d31544e179b760432952c02a4417bdde39","c90ddf8dee4e95cf577066d70681f0d35e2a33d2b56d2032b4b1752d1901ac01"],["c738c56b03b2abe1e8281baa743f8f9a8f7cc643df26cbee3ab150242bcbb891","893fb578951ad2537f718f2eacbfbbbb82314eef7880cfe917e735d9699a84c3"],["d895626548b65b81e264c7637c972877d1d72e5f3a925014372e9f6588f6c14b","febfaa38f2bc7eae728ec60818c340eb03428d632bb067e179363ed75d7d991f"],["b8da94032a957518eb0f6433571e8761ceffc73693e84edd49150a564f676e03","2804dfa44805a1e4d7c99cc9762808b092cc584d95ff3b511488e4e74efdf6e7"],["e80fea14441fb33a7d8adab9475d7fab2019effb5156a792f1a11778e3c0df5d","eed1de7f638e00771e89768ca3ca94472d155e80af322ea9fcb4291b6ac9ec78"],["a301697bdfcd704313ba48e51d567543f2a182031efd6915ddc07bbcc4e16070","7370f91cfb67e4f5081809fa25d40f9b1735dbf7c0a11a130c0d1a041e177ea1"],["90ad85b389d6b936463f9d0512678de208cc330b11307fffab7ac63e3fb04ed4","e507a3620a38261affdcbd9427222b839aefabe1582894d991d4d48cb6ef150"],["8f68b9d2f63b5f339239c1ad981f162ee88c5678723ea3351b7b444c9ec4c0da","662a9f2dba063986de1d90c2b6be215dbbea2cfe95510bfdf23cbf79501fff82"],["e4f3fb0176af85d65ff99ff9198c36091f48e86503681e3e6686fd5053231e11","1e63633ad0ef4f1c1661a6d0ea02b7286cc7e74ec951d1c9822c38576feb73bc"],["8c00fa9b18ebf331eb961537a45a4266c7034f2f0d4e1d0716fb6eae20eae29e","efa47267fea521a1a9dc343a3736c974c2fadafa81e36c54e7d2a4c66702414b"],["e7a26ce69dd4829f3e10cec0a9e98ed3143d084f308b92c0997fddfc60cb3e41","2a758e300fa7984b471b006a1aafbb18d0a6b2c0420e83e20e8a9421cf2cfd51"],["b6459e0ee3662ec8d23540c223bcbdc571cbcb967d79424f3cf29eb3de6b80ef","67c876d06f3e06de1dadf16e5661db3c4b3ae6d48e35b2ff30bf0b61a71ba45"],["d68a80c8280bb840793234aa118f06231d6f1fc67e73c5a5deda0f5b496943e8","db8ba9fff4b586d00c4b1f9177b0e28b5b0e7b8f7845295a294c84266b133120"],["324aed7df65c804252dc0270907a30b09612aeb973449cea4095980fc28d3d5d","648a365774b61f2ff130c0c35aec1f4f19213b0c7e332843967224af96ab7c84"],["4df9c14919cde61f6d51dfdbe5fee5dceec4143ba8d1ca888e8bd373fd054c96","35ec51092d8728050974c23a1d85d4b5d506cdc288490192ebac06cad10d5d"],["9c3919a84a474870faed8a9c1cc66021523489054d7f0308cbfc99c8ac1f98cd","ddb84f0f4a4ddd57584f044bf260e641905326f76c64c8e6be7e5e03d4fc599d"],["6057170b1dd12fdf8de05f281d8e06bb91e1493a8b91d4cc5a21382120a959e5","9a1af0b26a6a4807add9a2daf71df262465152bc3ee24c65e899be932385a2a8"],["a576df8e23a08411421439a4518da31880cef0fba7d4df12b1a6973eecb94266","40a6bf20e76640b2c92b97afe58cd82c432e10a7f514d9f3ee8be11ae1b28ec8"],["7778a78c28dec3e30a05fe9629de8c38bb30d1f5cf9a3a208f763889be58ad71","34626d9ab5a5b22ff7098e12f2ff580087b38411ff24ac563b513fc1fd9f43ac"],["928955ee637a84463729fd30e7afd2ed5f96274e5ad7e5cb09eda9c06d903ac","c25621003d3f42a827b78a13093a95eeac3d26efa8a8d83fc5180e935bcd091f"],["85d0fef3ec6db109399064f3a0e3b2855645b4a907ad354527aae75163d82751","1f03648413a38c0be29d496e582cf5663e8751e96877331582c237a24eb1f962"],["ff2b0dce97eece97c1c9b6041798b85dfdfb6d8882da20308f5404824526087e","493d13fef524ba188af4c4dc54d07936c7b7ed6fb90e2ceb2c951e01f0c29907"],["827fbbe4b1e880ea9ed2b2e6301b212b57f1ee148cd6dd28780e5e2cf856e241","c60f9c923c727b0b71bef2c67d1d12687ff7a63186903166d605b68baec293ec"],["eaa649f21f51bdbae7be4ae34ce6e5217a58fdce7f47f9aa7f3b58fa2120e2b3","be3279ed5bbbb03ac69a80f89879aa5a01a6b965f13f7e59d47a5305ba5ad93d"],["e4a42d43c5cf169d9391df6decf42ee541b6d8f0c9a137401e23632dda34d24f","4d9f92e716d1c73526fc99ccfb8ad34ce886eedfa8d8e4f13a7f7131deba9414"],["1ec80fef360cbdd954160fadab352b6b92b53576a88fea4947173b9d4300bf19","aeefe93756b5340d2f3a4958a7abbf5e0146e77f6295a07b671cdc1cc107cefd"],["146a778c04670c2f91b00af4680dfa8bce3490717d58ba889ddb5928366642be","b318e0ec3354028add669827f9d4b2870aaa971d2f7e5ed1d0b297483d83efd0"],["fa50c0f61d22e5f07e3acebb1aa07b128d0012209a28b9776d76a8793180eef9","6b84c6922397eba9b72cd2872281a68a5e683293a57a213b38cd8d7d3f4f2811"],["da1d61d0ca721a11b1a5bf6b7d88e8421a288ab5d5bba5220e53d32b5f067ec2","8157f55a7c99306c79c0766161c91e2966a73899d279b48a655fba0f1ad836f1"],["a8e282ff0c9706907215ff98e8fd416615311de0446f1e062a73b0610d064e13","7f97355b8db81c09abfb7f3c5b2515888b679a3e50dd6bd6cef7c73111f4cc0c"],["174a53b9c9a285872d39e56e6913cab15d59b1fa512508c022f382de8319497c","ccc9dc37abfc9c1657b4155f2c47f9e6646b3a1d8cb9854383da13ac079afa73"],["959396981943785c3d3e57edf5018cdbe039e730e4918b3d884fdff09475b7ba","2e7e552888c331dd8ba0386a4b9cd6849c653f64c8709385e9b8abf87524f2fd"],["d2a63a50ae401e56d645a1153b109a8fcca0a43d561fba2dbb51340c9d82b151","e82d86fb6443fcb7565aee58b2948220a70f750af484ca52d4142174dcf89405"],["64587e2335471eb890ee7896d7cfdc866bacbdbd3839317b3436f9b45617e073","d99fcdd5bf6902e2ae96dd6447c299a185b90a39133aeab358299e5e9faf6589"],["8481bde0e4e4d885b3a546d3e549de042f0aa6cea250e7fd358d6c86dd45e458","38ee7b8cba5404dd84a25bf39cecb2ca900a79c42b262e556d64b1b59779057e"],["13464a57a78102aa62b6979ae817f4637ffcfed3c4b1ce30bcd6303f6caf666b","69be159004614580ef7e433453ccb0ca48f300a81d0942e13f495a907f6ecc27"],["bc4a9df5b713fe2e9aef430bcc1dc97a0cd9ccede2f28588cada3a0d2d83f366","d3a81ca6e785c06383937adf4b798caa6e8a9fbfa547b16d758d666581f33c1"],["8c28a97bf8298bc0d23d8c749452a32e694b65e30a9472a3954ab30fe5324caa","40a30463a3305193378fedf31f7cc0eb7ae784f0451cb9459e71dc73cbef9482"],["8ea9666139527a8c1dd94ce4f071fd23c8b350c5a4bb33748c4ba111faccae0","620efabbc8ee2782e24e7c0cfb95c5d735b783be9cf0f8e955af34a30e62b945"],["dd3625faef5ba06074669716bbd3788d89bdde815959968092f76cc4eb9a9787","7a188fa3520e30d461da2501045731ca941461982883395937f68d00c644a573"],["f710d79d9eb962297e4f6232b40e8f7feb2bc63814614d692c12de752408221e","ea98e67232d3b3295d3b535532115ccac8612c721851617526ae47a9c77bfc82"]]},naf:{wnd:7,points:[["f9308a019258c31049344f85f89d5229b531c845836f99b08601f113bce036f9","388f7b0f632de8140fe337e62a37f3566500a99934c2231b6cb9fd7584b8e672"],["2f8bde4d1a07209355b4a7250a5c5128e88b84bddc619ab7cba8d569b240efe4","d8ac222636e5e3d6d4dba9dda6c9c426f788271bab0d6840dca87d3aa6ac62d6"],["5cbdf0646e5db4eaa398f365f2ea7a0e3d419b7e0330e39ce92bddedcac4f9bc","6aebca40ba255960a3178d6d861a54dba813d0b813fde7b5a5082628087264da"],["acd484e2f0c7f65309ad178a9f559abde09796974c57e714c35f110dfc27ccbe","cc338921b0a7d9fd64380971763b61e9add888a4375f8e0f05cc262ac64f9c37"],["774ae7f858a9411e5ef4246b70c65aac5649980be5c17891bbec17895da008cb","d984a032eb6b5e190243dd56d7b7b365372db1e2dff9d6a8301d74c9c953c61b"],["f28773c2d975288bc7d1d205c3748651b075fbc6610e58cddeeddf8f19405aa8","ab0902e8d880a89758212eb65cdaf473a1a06da521fa91f29b5cb52db03ed81"],["d7924d4f7d43ea965a465ae3095ff41131e5946f3c85f79e44adbcf8e27e080e","581e2872a86c72a683842ec228cc6defea40af2bd896d3a5c504dc9ff6a26b58"],["defdea4cdb677750a420fee807eacf21eb9898ae79b9768766e4faa04a2d4a34","4211ab0694635168e997b0ead2a93daeced1f4a04a95c0f6cfb199f69e56eb77"],["2b4ea0a797a443d293ef5cff444f4979f06acfebd7e86d277475656138385b6c","85e89bc037945d93b343083b5a1c86131a01f60c50269763b570c854e5c09b7a"],["352bbf4a4cdd12564f93fa332ce333301d9ad40271f8107181340aef25be59d5","321eb4075348f534d59c18259dda3e1f4a1b3b2e71b1039c67bd3d8bcf81998c"],["2fa2104d6b38d11b0230010559879124e42ab8dfeff5ff29dc9cdadd4ecacc3f","2de1068295dd865b64569335bd5dd80181d70ecfc882648423ba76b532b7d67"],["9248279b09b4d68dab21a9b066edda83263c3d84e09572e269ca0cd7f5453714","73016f7bf234aade5d1aa71bdea2b1ff3fc0de2a887912ffe54a32ce97cb3402"],["daed4f2be3a8bf278e70132fb0beb7522f570e144bf615c07e996d443dee8729","a69dce4a7d6c98e8d4a1aca87ef8d7003f83c230f3afa726ab40e52290be1c55"],["c44d12c7065d812e8acf28d7cbb19f9011ecd9e9fdf281b0e6a3b5e87d22e7db","2119a460ce326cdc76c45926c982fdac0e106e861edf61c5a039063f0e0e6482"],["6a245bf6dc698504c89a20cfded60853152b695336c28063b61c65cbd269e6b4","e022cf42c2bd4a708b3f5126f16a24ad8b33ba48d0423b6efd5e6348100d8a82"],["1697ffa6fd9de627c077e3d2fe541084ce13300b0bec1146f95ae57f0d0bd6a5","b9c398f186806f5d27561506e4557433a2cf15009e498ae7adee9d63d01b2396"],["605bdb019981718b986d0f07e834cb0d9deb8360ffb7f61df982345ef27a7479","2972d2de4f8d20681a78d93ec96fe23c26bfae84fb14db43b01e1e9056b8c49"],["62d14dab4150bf497402fdc45a215e10dcb01c354959b10cfe31c7e9d87ff33d","80fc06bd8cc5b01098088a1950eed0db01aa132967ab472235f5642483b25eaf"],["80c60ad0040f27dade5b4b06c408e56b2c50e9f56b9b8b425e555c2f86308b6f","1c38303f1cc5c30f26e66bad7fe72f70a65eed4cbe7024eb1aa01f56430bd57a"],["7a9375ad6167ad54aa74c6348cc54d344cc5dc9487d847049d5eabb0fa03c8fb","d0e3fa9eca8726909559e0d79269046bdc59ea10c70ce2b02d499ec224dc7f7"],["d528ecd9b696b54c907a9ed045447a79bb408ec39b68df504bb51f459bc3ffc9","eecf41253136e5f99966f21881fd656ebc4345405c520dbc063465b521409933"],["49370a4b5f43412ea25f514e8ecdad05266115e4a7ecb1387231808f8b45963","758f3f41afd6ed428b3081b0512fd62a54c3f3afbb5b6764b653052a12949c9a"],["77f230936ee88cbbd73df930d64702ef881d811e0e1498e2f1c13eb1fc345d74","958ef42a7886b6400a08266e9ba1b37896c95330d97077cbbe8eb3c7671c60d6"],["f2dac991cc4ce4b9ea44887e5c7c0bce58c80074ab9d4dbaeb28531b7739f530","e0dedc9b3b2f8dad4da1f32dec2531df9eb5fbeb0598e4fd1a117dba703a3c37"],["463b3d9f662621fb1b4be8fbbe2520125a216cdfc9dae3debcba4850c690d45b","5ed430d78c296c3543114306dd8622d7c622e27c970a1de31cb377b01af7307e"],["f16f804244e46e2a09232d4aff3b59976b98fac14328a2d1a32496b49998f247","cedabd9b82203f7e13d206fcdf4e33d92a6c53c26e5cce26d6579962c4e31df6"],["caf754272dc84563b0352b7a14311af55d245315ace27c65369e15f7151d41d1","cb474660ef35f5f2a41b643fa5e460575f4fa9b7962232a5c32f908318a04476"],["2600ca4b282cb986f85d0f1709979d8b44a09c07cb86d7c124497bc86f082120","4119b88753c15bd6a693b03fcddbb45d5ac6be74ab5f0ef44b0be9475a7e4b40"],["7635ca72d7e8432c338ec53cd12220bc01c48685e24f7dc8c602a7746998e435","91b649609489d613d1d5e590f78e6d74ecfc061d57048bad9e76f302c5b9c61"],["754e3239f325570cdbbf4a87deee8a66b7f2b33479d468fbc1a50743bf56cc18","673fb86e5bda30fb3cd0ed304ea49a023ee33d0197a695d0c5d98093c536683"],["e3e6bd1071a1e96aff57859c82d570f0330800661d1c952f9fe2694691d9b9e8","59c9e0bba394e76f40c0aa58379a3cb6a5a2283993e90c4167002af4920e37f5"],["186b483d056a033826ae73d88f732985c4ccb1f32ba35f4b4cc47fdcf04aa6eb","3b952d32c67cf77e2e17446e204180ab21fb8090895138b4a4a797f86e80888b"],["df9d70a6b9876ce544c98561f4be4f725442e6d2b737d9c91a8321724ce0963f","55eb2dafd84d6ccd5f862b785dc39d4ab157222720ef9da217b8c45cf2ba2417"],["5edd5cc23c51e87a497ca815d5dce0f8ab52554f849ed8995de64c5f34ce7143","efae9c8dbc14130661e8cec030c89ad0c13c66c0d17a2905cdc706ab7399a868"],["290798c2b6476830da12fe02287e9e777aa3fba1c355b17a722d362f84614fba","e38da76dcd440621988d00bcf79af25d5b29c094db2a23146d003afd41943e7a"],["af3c423a95d9f5b3054754efa150ac39cd29552fe360257362dfdecef4053b45","f98a3fd831eb2b749a93b0e6f35cfb40c8cd5aa667a15581bc2feded498fd9c6"],["766dbb24d134e745cccaa28c99bf274906bb66b26dcf98df8d2fed50d884249a","744b1152eacbe5e38dcc887980da38b897584a65fa06cedd2c924f97cbac5996"],["59dbf46f8c94759ba21277c33784f41645f7b44f6c596a58ce92e666191abe3e","c534ad44175fbc300f4ea6ce648309a042ce739a7919798cd85e216c4a307f6e"],["f13ada95103c4537305e691e74e9a4a8dd647e711a95e73cb62dc6018cfd87b8","e13817b44ee14de663bf4bc808341f326949e21a6a75c2570778419bdaf5733d"],["7754b4fa0e8aced06d4167a2c59cca4cda1869c06ebadfb6488550015a88522c","30e93e864e669d82224b967c3020b8fa8d1e4e350b6cbcc537a48b57841163a2"],["948dcadf5990e048aa3874d46abef9d701858f95de8041d2a6828c99e2262519","e491a42537f6e597d5d28a3224b1bc25df9154efbd2ef1d2cbba2cae5347d57e"],["7962414450c76c1689c7b48f8202ec37fb224cf5ac0bfa1570328a8a3d7c77ab","100b610ec4ffb4760d5c1fc133ef6f6b12507a051f04ac5760afa5b29db83437"],["3514087834964b54b15b160644d915485a16977225b8847bb0dd085137ec47ca","ef0afbb2056205448e1652c48e8127fc6039e77c15c2378b7e7d15a0de293311"],["d3cc30ad6b483e4bc79ce2c9dd8bc54993e947eb8df787b442943d3f7b527eaf","8b378a22d827278d89c5e9be8f9508ae3c2ad46290358630afb34db04eede0a4"],["1624d84780732860ce1c78fcbfefe08b2b29823db913f6493975ba0ff4847610","68651cf9b6da903e0914448c6cd9d4ca896878f5282be4c8cc06e2a404078575"],["733ce80da955a8a26902c95633e62a985192474b5af207da6df7b4fd5fc61cd4","f5435a2bd2badf7d485a4d8b8db9fcce3e1ef8e0201e4578c54673bc1dc5ea1d"],["15d9441254945064cf1a1c33bbd3b49f8966c5092171e699ef258dfab81c045c","d56eb30b69463e7234f5137b73b84177434800bacebfc685fc37bbe9efe4070d"],["a1d0fcf2ec9de675b612136e5ce70d271c21417c9d2b8aaaac138599d0717940","edd77f50bcb5a3cab2e90737309667f2641462a54070f3d519212d39c197a629"],["e22fbe15c0af8ccc5780c0735f84dbe9a790badee8245c06c7ca37331cb36980","a855babad5cd60c88b430a69f53a1a7a38289154964799be43d06d77d31da06"],["311091dd9860e8e20ee13473c1155f5f69635e394704eaa74009452246cfa9b3","66db656f87d1f04fffd1f04788c06830871ec5a64feee685bd80f0b1286d8374"],["34c1fd04d301be89b31c0442d3e6ac24883928b45a9340781867d4232ec2dbdf","9414685e97b1b5954bd46f730174136d57f1ceeb487443dc5321857ba73abee"],["f219ea5d6b54701c1c14de5b557eb42a8d13f3abbcd08affcc2a5e6b049b8d63","4cb95957e83d40b0f73af4544cccf6b1f4b08d3c07b27fb8d8c2962a400766d1"],["d7b8740f74a8fbaab1f683db8f45de26543a5490bca627087236912469a0b448","fa77968128d9c92ee1010f337ad4717eff15db5ed3c049b3411e0315eaa4593b"],["32d31c222f8f6f0ef86f7c98d3a3335ead5bcd32abdd94289fe4d3091aa824bf","5f3032f5892156e39ccd3d7915b9e1da2e6dac9e6f26e961118d14b8462e1661"],["7461f371914ab32671045a155d9831ea8793d77cd59592c4340f86cbc18347b5","8ec0ba238b96bec0cbdddcae0aa442542eee1ff50c986ea6b39847b3cc092ff6"],["ee079adb1df1860074356a25aa38206a6d716b2c3e67453d287698bad7b2b2d6","8dc2412aafe3be5c4c5f37e0ecc5f9f6a446989af04c4e25ebaac479ec1c8c1e"],["16ec93e447ec83f0467b18302ee620f7e65de331874c9dc72bfd8616ba9da6b5","5e4631150e62fb40d0e8c2a7ca5804a39d58186a50e497139626778e25b0674d"],["eaa5f980c245f6f038978290afa70b6bd8855897f98b6aa485b96065d537bd99","f65f5d3e292c2e0819a528391c994624d784869d7e6ea67fb18041024edc07dc"],["78c9407544ac132692ee1910a02439958ae04877151342ea96c4b6b35a49f51","f3e0319169eb9b85d5404795539a5e68fa1fbd583c064d2462b675f194a3ddb4"],["494f4be219a1a77016dcd838431aea0001cdc8ae7a6fc688726578d9702857a5","42242a969283a5f339ba7f075e36ba2af925ce30d767ed6e55f4b031880d562c"],["a598a8030da6d86c6bc7f2f5144ea549d28211ea58faa70ebf4c1e665c1fe9b5","204b5d6f84822c307e4b4a7140737aec23fc63b65b35f86a10026dbd2d864e6b"],["c41916365abb2b5d09192f5f2dbeafec208f020f12570a184dbadc3e58595997","4f14351d0087efa49d245b328984989d5caf9450f34bfc0ed16e96b58fa9913"],["841d6063a586fa475a724604da03bc5b92a2e0d2e0a36acfe4c73a5514742881","73867f59c0659e81904f9a1c7543698e62562d6744c169ce7a36de01a8d6154"],["5e95bb399a6971d376026947f89bde2f282b33810928be4ded112ac4d70e20d5","39f23f366809085beebfc71181313775a99c9aed7d8ba38b161384c746012865"],["36e4641a53948fd476c39f8a99fd974e5ec07564b5315d8bf99471bca0ef2f66","d2424b1b1abe4eb8164227b085c9aa9456ea13493fd563e06fd51cf5694c78fc"],["336581ea7bfbbb290c191a2f507a41cf5643842170e914faeab27c2c579f726","ead12168595fe1be99252129b6e56b3391f7ab1410cd1e0ef3dcdcabd2fda224"],["8ab89816dadfd6b6a1f2634fcf00ec8403781025ed6890c4849742706bd43ede","6fdcef09f2f6d0a044e654aef624136f503d459c3e89845858a47a9129cdd24e"],["1e33f1a746c9c5778133344d9299fcaa20b0938e8acff2544bb40284b8c5fb94","60660257dd11b3aa9c8ed618d24edff2306d320f1d03010e33a7d2057f3b3b6"],["85b7c1dcb3cec1b7ee7f30ded79dd20a0ed1f4cc18cbcfcfa410361fd8f08f31","3d98a9cdd026dd43f39048f25a8847f4fcafad1895d7a633c6fed3c35e999511"],["29df9fbd8d9e46509275f4b125d6d45d7fbe9a3b878a7af872a2800661ac5f51","b4c4fe99c775a606e2d8862179139ffda61dc861c019e55cd2876eb2a27d84b"],["a0b1cae06b0a847a3fea6e671aaf8adfdfe58ca2f768105c8082b2e449fce252","ae434102edde0958ec4b19d917a6a28e6b72da1834aff0e650f049503a296cf2"],["4e8ceafb9b3e9a136dc7ff67e840295b499dfb3b2133e4ba113f2e4c0e121e5","cf2174118c8b6d7a4b48f6d534ce5c79422c086a63460502b827ce62a326683c"],["d24a44e047e19b6f5afb81c7ca2f69080a5076689a010919f42725c2b789a33b","6fb8d5591b466f8fc63db50f1c0f1c69013f996887b8244d2cdec417afea8fa3"],["ea01606a7a6c9cdd249fdfcfacb99584001edd28abbab77b5104e98e8e3b35d4","322af4908c7312b0cfbfe369f7a7b3cdb7d4494bc2823700cfd652188a3ea98d"],["af8addbf2b661c8a6c6328655eb96651252007d8c5ea31be4ad196de8ce2131f","6749e67c029b85f52a034eafd096836b2520818680e26ac8f3dfbcdb71749700"],["e3ae1974566ca06cc516d47e0fb165a674a3dabcfca15e722f0e3450f45889","2aeabe7e4531510116217f07bf4d07300de97e4874f81f533420a72eeb0bd6a4"],["591ee355313d99721cf6993ffed1e3e301993ff3ed258802075ea8ced397e246","b0ea558a113c30bea60fc4775460c7901ff0b053d25ca2bdeee98f1a4be5d196"],["11396d55fda54c49f19aa97318d8da61fa8584e47b084945077cf03255b52984","998c74a8cd45ac01289d5833a7beb4744ff536b01b257be4c5767bea93ea57a4"],["3c5d2a1ba39c5a1790000738c9e0c40b8dcdfd5468754b6405540157e017aa7a","b2284279995a34e2f9d4de7396fc18b80f9b8b9fdd270f6661f79ca4c81bd257"],["cc8704b8a60a0defa3a99a7299f2e9c3fbc395afb04ac078425ef8a1793cc030","bdd46039feed17881d1e0862db347f8cf395b74fc4bcdc4e940b74e3ac1f1b13"],["c533e4f7ea8555aacd9777ac5cad29b97dd4defccc53ee7ea204119b2889b197","6f0a256bc5efdf429a2fb6242f1a43a2d9b925bb4a4b3a26bb8e0f45eb596096"],["c14f8f2ccb27d6f109f6d08d03cc96a69ba8c34eec07bbcf566d48e33da6593","c359d6923bb398f7fd4473e16fe1c28475b740dd098075e6c0e8649113dc3a38"],["a6cbc3046bc6a450bac24789fa17115a4c9739ed75f8f21ce441f72e0b90e6ef","21ae7f4680e889bb130619e2c0f95a360ceb573c70603139862afd617fa9b9f"],["347d6d9a02c48927ebfb86c1359b1caf130a3c0267d11ce6344b39f99d43cc38","60ea7f61a353524d1c987f6ecec92f086d565ab687870cb12689ff1e31c74448"],["da6545d2181db8d983f7dcb375ef5866d47c67b1bf31c8cf855ef7437b72656a","49b96715ab6878a79e78f07ce5680c5d6673051b4935bd897fea824b77dc208a"],["c40747cc9d012cb1a13b8148309c6de7ec25d6945d657146b9d5994b8feb1111","5ca560753be2a12fc6de6caf2cb489565db936156b9514e1bb5e83037e0fa2d4"],["4e42c8ec82c99798ccf3a610be870e78338c7f713348bd34c8203ef4037f3502","7571d74ee5e0fb92a7a8b33a07783341a5492144cc54bcc40a94473693606437"],["3775ab7089bc6af823aba2e1af70b236d251cadb0c86743287522a1b3b0dedea","be52d107bcfa09d8bcb9736a828cfa7fac8db17bf7a76a2c42ad961409018cf7"],["cee31cbf7e34ec379d94fb814d3d775ad954595d1314ba8846959e3e82f74e26","8fd64a14c06b589c26b947ae2bcf6bfa0149ef0be14ed4d80f448a01c43b1c6d"],["b4f9eaea09b6917619f6ea6a4eb5464efddb58fd45b1ebefcdc1a01d08b47986","39e5c9925b5a54b07433a4f18c61726f8bb131c012ca542eb24a8ac07200682a"],["d4263dfc3d2df923a0179a48966d30ce84e2515afc3dccc1b77907792ebcc60e","62dfaf07a0f78feb30e30d6295853ce189e127760ad6cf7fae164e122a208d54"],["48457524820fa65a4f8d35eb6930857c0032acc0a4a2de422233eeda897612c4","25a748ab367979d98733c38a1fa1c2e7dc6cc07db2d60a9ae7a76aaa49bd0f77"],["dfeeef1881101f2cb11644f3a2afdfc2045e19919152923f367a1767c11cceda","ecfb7056cf1de042f9420bab396793c0c390bde74b4bbdff16a83ae09a9a7517"],["6d7ef6b17543f8373c573f44e1f389835d89bcbc6062ced36c82df83b8fae859","cd450ec335438986dfefa10c57fea9bcc521a0959b2d80bbf74b190dca712d10"],["e75605d59102a5a2684500d3b991f2e3f3c88b93225547035af25af66e04541f","f5c54754a8f71ee540b9b48728473e314f729ac5308b06938360990e2bfad125"],["eb98660f4c4dfaa06a2be453d5020bc99a0c2e60abe388457dd43fefb1ed620c","6cb9a8876d9cb8520609af3add26cd20a0a7cd8a9411131ce85f44100099223e"],["13e87b027d8514d35939f2e6892b19922154596941888336dc3563e3b8dba942","fef5a3c68059a6dec5d624114bf1e91aac2b9da568d6abeb2570d55646b8adf1"],["ee163026e9fd6fe017c38f06a5be6fc125424b371ce2708e7bf4491691e5764a","1acb250f255dd61c43d94ccc670d0f58f49ae3fa15b96623e5430da0ad6c62b2"],["b268f5ef9ad51e4d78de3a750c2dc89b1e626d43505867999932e5db33af3d80","5f310d4b3c99b9ebb19f77d41c1dee018cf0d34fd4191614003e945a1216e423"],["ff07f3118a9df035e9fad85eb6c7bfe42b02f01ca99ceea3bf7ffdba93c4750d","438136d603e858a3a5c440c38eccbaddc1d2942114e2eddd4740d098ced1f0d8"],["8d8b9855c7c052a34146fd20ffb658bea4b9f69e0d825ebec16e8c3ce2b526a1","cdb559eedc2d79f926baf44fb84ea4d44bcf50fee51d7ceb30e2e7f463036758"],["52db0b5384dfbf05bfa9d472d7ae26dfe4b851ceca91b1eba54263180da32b63","c3b997d050ee5d423ebaf66a6db9f57b3180c902875679de924b69d84a7b375"],["e62f9490d3d51da6395efd24e80919cc7d0f29c3f3fa48c6fff543becbd43352","6d89ad7ba4876b0b22c2ca280c682862f342c8591f1daf5170e07bfd9ccafa7d"],["7f30ea2476b399b4957509c88f77d0191afa2ff5cb7b14fd6d8e7d65aaab1193","ca5ef7d4b231c94c3b15389a5f6311e9daff7bb67b103e9880ef4bff637acaec"],["5098ff1e1d9f14fb46a210fada6c903fef0fb7b4a1dd1d9ac60a0361800b7a00","9731141d81fc8f8084d37c6e7542006b3ee1b40d60dfe5362a5b132fd17ddc0"],["32b78c7de9ee512a72895be6b9cbefa6e2f3c4ccce445c96b9f2c81e2778ad58","ee1849f513df71e32efc3896ee28260c73bb80547ae2275ba497237794c8753c"],["e2cb74fddc8e9fbcd076eef2a7c72b0ce37d50f08269dfc074b581550547a4f7","d3aa2ed71c9dd2247a62df062736eb0baddea9e36122d2be8641abcb005cc4a4"],["8438447566d4d7bedadc299496ab357426009a35f235cb141be0d99cd10ae3a8","c4e1020916980a4da5d01ac5e6ad330734ef0d7906631c4f2390426b2edd791f"],["4162d488b89402039b584c6fc6c308870587d9c46f660b878ab65c82c711d67e","67163e903236289f776f22c25fb8a3afc1732f2b84b4e95dbda47ae5a0852649"],["3fad3fa84caf0f34f0f89bfd2dcf54fc175d767aec3e50684f3ba4a4bf5f683d","cd1bc7cb6cc407bb2f0ca647c718a730cf71872e7d0d2a53fa20efcdfe61826"],["674f2600a3007a00568c1a7ce05d0816c1fb84bf1370798f1c69532faeb1a86b","299d21f9413f33b3edf43b257004580b70db57da0b182259e09eecc69e0d38a5"],["d32f4da54ade74abb81b815ad1fb3b263d82d6c692714bcff87d29bd5ee9f08f","f9429e738b8e53b968e99016c059707782e14f4535359d582fc416910b3eea87"],["30e4e670435385556e593657135845d36fbb6931f72b08cb1ed954f1e3ce3ff6","462f9bce619898638499350113bbc9b10a878d35da70740dc695a559eb88db7b"],["be2062003c51cc3004682904330e4dee7f3dcd10b01e580bf1971b04d4cad297","62188bc49d61e5428573d48a74e1c655b1c61090905682a0d5558ed72dccb9bc"],["93144423ace3451ed29e0fb9ac2af211cb6e84a601df5993c419859fff5df04a","7c10dfb164c3425f5c71a3f9d7992038f1065224f72bb9d1d902a6d13037b47c"],["b015f8044f5fcbdcf21ca26d6c34fb8197829205c7b7d2a7cb66418c157b112c","ab8c1e086d04e813744a655b2df8d5f83b3cdc6faa3088c1d3aea1454e3a1d5f"],["d5e9e1da649d97d89e4868117a465a3a4f8a18de57a140d36b3f2af341a21b52","4cb04437f391ed73111a13cc1d4dd0db1693465c2240480d8955e8592f27447a"],["d3ae41047dd7ca065dbf8ed77b992439983005cd72e16d6f996a5316d36966bb","bd1aeb21ad22ebb22a10f0303417c6d964f8cdd7df0aca614b10dc14d125ac46"],["463e2763d885f958fc66cdd22800f0a487197d0a82e377b49f80af87c897b065","bfefacdb0e5d0fd7df3a311a94de062b26b80c61fbc97508b79992671ef7ca7f"],["7985fdfd127c0567c6f53ec1bb63ec3158e597c40bfe747c83cddfc910641917","603c12daf3d9862ef2b25fe1de289aed24ed291e0ec6708703a5bd567f32ed03"],["74a1ad6b5f76e39db2dd249410eac7f99e74c59cb83d2d0ed5ff1543da7703e9","cc6157ef18c9c63cd6193d83631bbea0093e0968942e8c33d5737fd790e0db08"],["30682a50703375f602d416664ba19b7fc9bab42c72747463a71d0896b22f6da3","553e04f6b018b4fa6c8f39e7f311d3176290d0e0f19ca73f17714d9977a22ff8"],["9e2158f0d7c0d5f26c3791efefa79597654e7a2b2464f52b1ee6c1347769ef57","712fcdd1b9053f09003a3481fa7762e9ffd7c8ef35a38509e2fbf2629008373"],["176e26989a43c9cfeba4029c202538c28172e566e3c4fce7322857f3be327d66","ed8cc9d04b29eb877d270b4878dc43c19aefd31f4eee09ee7b47834c1fa4b1c3"],["75d46efea3771e6e68abb89a13ad747ecf1892393dfc4f1b7004788c50374da8","9852390a99507679fd0b86fd2b39a868d7efc22151346e1a3ca4726586a6bed8"],["809a20c67d64900ffb698c4c825f6d5f2310fb0451c869345b7319f645605721","9e994980d9917e22b76b061927fa04143d096ccc54963e6a5ebfa5f3f8e286c1"],["1b38903a43f7f114ed4500b4eac7083fdefece1cf29c63528d563446f972c180","4036edc931a60ae889353f77fd53de4a2708b26b6f5da72ad3394119daf408f9"]]}}},function(t,e,r){"use strict";var n=r(3),i=r(116),o=r(2),a=o.utils.assert,f=r(117),s=r(118);function c(t){if(!(this instanceof c))return new c(t);"string"==typeof t&&(a(o.curves.hasOwnProperty(t),"Unknown curve "+t),t=o.curves[t]),t instanceof o.curves.PresetCurve&&(t={curve:t}),this.curve=t.curve.curve,this.n=this.curve.n,this.nh=this.n.ushrn(1),this.g=this.curve.g,this.g=t.curve.g,this.g.precompute(t.curve.n.bitLength()+1),this.hash=t.hash||t.curve.hash}t.exports=c,c.prototype.keyPair=function(t){return new f(this,t)},c.prototype.keyFromPrivate=function(t,e){return f.fromPrivate(this,t,e)},c.prototype.keyFromPublic=function(t,e){return f.fromPublic(this,t,e)},c.prototype.genKeyPair=function(t){t||(t={});for(var e=new i({hash:this.hash,pers:t.pers,persEnc:t.persEnc||"utf8",entropy:t.entropy||o.rand(this.hash.hmacStrength),entropyEnc:t.entropy&&t.entropyEnc||"utf8",nonce:this.n.toArray()}),r=this.n.byteLength(),a=this.n.sub(new n(2));;){var f=new n(e.generate(r));if(!(f.cmp(a)>0))return f.iaddn(1),this.keyFromPrivate(f)}},c.prototype._truncateToN=function(t,e){var r=8*t.byteLength()-this.n.bitLength();return r>0&&(t=t.ushrn(r)),!e&&t.cmp(this.n)>=0?t.sub(this.n):t},c.prototype.sign=function(t,e,r,o){"object"==typeof r&&(o=r,r=null),o||(o={}),e=this.keyFromPrivate(e,r),t=this._truncateToN(new n(t,16));for(var a=this.n.byteLength(),f=e.getPrivate().toArray("be",a),c=t.toArray("be",a),u=new i({hash:this.hash,entropy:f,nonce:c,pers:o.pers,persEnc:o.persEnc||"utf8"}),h=this.n.sub(new n(1)),d=0;;d++){var l=o.k?o.k(d):new n(u.generate(this.n.byteLength()));if(!((l=this._truncateToN(l,!0)).cmpn(1)<=0||l.cmp(h)>=0)){var p=this.g.mul(l);if(!p.isInfinity()){var b=p.getX(),y=b.umod(this.n);if(0!==y.cmpn(0)){var v=l.invm(this.n).mul(y.mul(e.getPrivate()).iadd(t));if(0!==(v=v.umod(this.n)).cmpn(0)){var g=(p.getY().isOdd()?1:0)|(0!==b.cmp(y)?2:0);return o.canonical&&v.cmp(this.nh)>0&&(v=this.n.sub(v),g^=1),new s({r:y,s:v,recoveryParam:g})}}}}}},c.prototype.verify=function(t,e,r,i){t=this._truncateToN(new n(t,16)),r=this.keyFromPublic(r,i);var o=(e=new s(e,"hex")).r,a=e.s;if(o.cmpn(1)<0||o.cmp(this.n)>=0)return!1;if(a.cmpn(1)<0||a.cmp(this.n)>=0)return!1;var f,c=a.invm(this.n),u=c.mul(t).umod(this.n),h=c.mul(o).umod(this.n);return this.curve._maxwellTrick?!(f=this.g.jmulAdd(u,r.getPublic(),h)).isInfinity()&&f.eqXToP(o):!(f=this.g.mulAdd(u,r.getPublic(),h)).isInfinity()&&0===f.getX().umod(this.n).cmp(o)},c.prototype.recoverPubKey=function(t,e,r,i){a((3&r)===r,"The recovery param is more than two bits"),e=new s(e,i);var o=this.n,f=new n(t),c=e.r,u=e.s,h=1&r,d=r>>1;if(c.cmp(this.curve.p.umod(this.curve.n))>=0&&d)throw new Error("Unable to find sencond key candinate");c=d?this.curve.pointFromX(c.add(this.curve.n),h):this.curve.pointFromX(c,h);var l=e.r.invm(o),p=o.sub(f).mul(l).umod(o),b=u.mul(l).umod(o);return this.g.mulAdd(p,c,b)},c.prototype.getKeyRecoveryParam=function(t,e,r,n){if(null!==(e=new s(e,n)).recoveryParam)return e.recoveryParam;for(var i=0;i<4;i++){var o;try{o=this.recoverPubKey(t,e,i)}catch(t){continue}if(o.eq(r))return i}throw new Error("Unable to find valid recovery factor")}},function(t,e,r){"use strict";var n=r(23),i=r(41),o=r(8);function a(t){if(!(this instanceof a))return new a(t);this.hash=t.hash,this.predResist=!!t.predResist,this.outLen=this.hash.outSize,this.minEntropy=t.minEntropy||this.hash.hmacStrength,this._reseed=null,this.reseedInterval=null,this.K=null,this.V=null;var e=i.toArray(t.entropy,t.entropyEnc||"hex"),r=i.toArray(t.nonce,t.nonceEnc||"hex"),n=i.toArray(t.pers,t.persEnc||"hex");o(e.length>=this.minEntropy/8,"Not enough entropy. Minimum is: "+this.minEntropy+" bits"),this._init(e,r,n)}t.exports=a,a.prototype._init=function(t,e,r){var n=t.concat(e).concat(r);this.K=new Array(this.outLen/8),this.V=new Array(this.outLen/8);for(var i=0;i<this.V.length;i++)this.K[i]=0,this.V[i]=1;this._update(n),this._reseed=1,this.reseedInterval=281474976710656},a.prototype._hmac=function(){return new n.hmac(this.hash,this.K)},a.prototype._update=function(t){var e=this._hmac().update(this.V).update([0]);t&&(e=e.update(t)),this.K=e.digest(),this.V=this._hmac().update(this.V).digest(),t&&(this.K=this._hmac().update(this.V).update([1]).update(t).digest(),this.V=this._hmac().update(this.V).digest())},a.prototype.reseed=function(t,e,r,n){"string"!=typeof e&&(n=r,r=e,e=null),t=i.toArray(t,e),r=i.toArray(r,n),o(t.length>=this.minEntropy/8,"Not enough entropy. Minimum is: "+this.minEntropy+" bits"),this._update(t.concat(r||[])),this._reseed=1},a.prototype.generate=function(t,e,r,n){if(this._reseed>this.reseedInterval)throw new Error("Reseed is required");"string"!=typeof e&&(n=r,r=e,e=null),r&&(r=i.toArray(r,n||"hex"),this._update(r));for(var o=[];o.length<t;)this.V=this._hmac().update(this.V).digest(),o=o.concat(this.V);var a=o.slice(0,t);return this._update(r),this._reseed++,i.encode(a,e)}},function(t,e,r){"use strict";var n=r(3),i=r(2).utils.assert;function o(t,e){this.ec=t,this.priv=null,this.pub=null,e.priv&&this._importPrivate(e.priv,e.privEnc),e.pub&&this._importPublic(e.pub,e.pubEnc)}t.exports=o,o.fromPublic=function(t,e,r){return e instanceof o?e:new o(t,{pub:e,pubEnc:r})},o.fromPrivate=function(t,e,r){return e instanceof o?e:new o(t,{priv:e,privEnc:r})},o.prototype.validate=function(){var t=this.getPublic();return t.isInfinity()?{result:!1,reason:"Invalid public key"}:t.validate()?t.mul(this.ec.curve.n).isInfinity()?{result:!0,reason:null}:{result:!1,reason:"Public key * N != O"}:{result:!1,reason:"Public key is not a point"}},o.prototype.getPublic=function(t,e){return"string"==typeof t&&(e=t,t=null),this.pub||(this.pub=this.ec.g.mul(this.priv)),e?this.pub.encode(e,t):this.pub},o.prototype.getPrivate=function(t){return"hex"===t?this.priv.toString(16,2):this.priv},o.prototype._importPrivate=function(t,e){this.priv=new n(t,e||16),this.priv=this.priv.umod(this.ec.curve.n)},o.prototype._importPublic=function(t,e){if(t.x||t.y)return"mont"===this.ec.curve.type?i(t.x,"Need x coordinate"):"short"!==this.ec.curve.type&&"edwards"!==this.ec.curve.type||i(t.x&&t.y,"Need both x and y coordinate"),void(this.pub=this.ec.curve.point(t.x,t.y));this.pub=this.ec.curve.decodePoint(t,e)},o.prototype.derive=function(t){return t.mul(this.priv).getX()},o.prototype.sign=function(t,e,r){return this.ec.sign(t,this,e,r)},o.prototype.verify=function(t,e){return this.ec.verify(t,e,this)},o.prototype.inspect=function(){return"<Key priv: "+(this.priv&&this.priv.toString(16,2))+" pub: "+(this.pub&&this.pub.inspect())+" >"}},function(t,e,r){"use strict";var n=r(3),i=r(2).utils,o=i.assert;function a(t,e){if(t instanceof a)return t;this._importDER(t,e)||(o(t.r&&t.s,"Signature without r or s"),this.r=new n(t.r,16),this.s=new n(t.s,16),void 0===t.recoveryParam?this.recoveryParam=null:this.recoveryParam=t.recoveryParam)}function f(t,e){var r=t[e.place++];if(!(128&r))return r;for(var n=15&r,i=0,o=0,a=e.place;o<n;o++,a++)i<<=8,i|=t[a];return e.place=a,i}function s(t){for(var e=0,r=t.length-1;!t[e]&&!(128&t[e+1])&&e<r;)e++;return 0===e?t:t.slice(e)}function c(t,e){if(e<128)t.push(e);else{var r=1+(Math.log(e)/Math.LN2>>>3);for(t.push(128|r);--r;)t.push(e>>>(r<<3)&255);t.push(e)}}t.exports=a,a.prototype._importDER=function(t,e){t=i.toArray(t,e);var r=new function(){this.place=0};if(48!==t[r.place++])return!1;if(f(t,r)+r.place!==t.length)return!1;if(2!==t[r.place++])return!1;var o=f(t,r),a=t.slice(r.place,o+r.place);if(r.place+=o,2!==t[r.place++])return!1;var s=f(t,r);if(t.length!==s+r.place)return!1;var c=t.slice(r.place,s+r.place);return 0===a[0]&&128&a[1]&&(a=a.slice(1)),0===c[0]&&128&c[1]&&(c=c.slice(1)),this.r=new n(a),this.s=new n(c),this.recoveryParam=null,!0},a.prototype.toDER=function(t){var e=this.r.toArray(),r=this.s.toArray();for(128&e[0]&&(e=[0].concat(e)),128&r[0]&&(r=[0].concat(r)),e=s(e),r=s(r);!(r[0]||128&r[1]);)r=r.slice(1);var n=[2];c(n,e.length),(n=n.concat(e)).push(2),c(n,r.length);var o=n.concat(r),a=[48];return c(a,o.length),a=a.concat(o),i.encode(a,t)}},function(t,e,r){"use strict";var n=r(23),i=r(2),o=i.utils,a=o.assert,f=o.parseBytes,s=r(120),c=r(121);function u(t){if(a("ed25519"===t,"only tested with ed25519 so far"),!(this instanceof u))return new u(t);t=i.curves[t].curve;this.curve=t,this.g=t.g,this.g.precompute(t.n.bitLength()+1),this.pointClass=t.point().constructor,this.encodingLength=Math.ceil(t.n.bitLength()/8),this.hash=n.sha512}t.exports=u,u.prototype.sign=function(t,e){t=f(t);var r=this.keyFromSecret(e),n=this.hashInt(r.messagePrefix(),t),i=this.g.mul(n),o=this.encodePoint(i),a=this.hashInt(o,r.pubBytes(),t).mul(r.priv()),s=n.add(a).umod(this.curve.n);return this.makeSignature({R:i,S:s,Rencoded:o})},u.prototype.verify=function(t,e,r){t=f(t),e=this.makeSignature(e);var n=this.keyFromPublic(r),i=this.hashInt(e.Rencoded(),n.pubBytes(),t),o=this.g.mul(e.S());return e.R().add(n.pub().mul(i)).eq(o)},u.prototype.hashInt=function(){for(var t=this.hash(),e=0;e<arguments.length;e++)t.update(arguments[e]);return o.intFromLE(t.digest()).umod(this.curve.n)},u.prototype.keyFromPublic=function(t){return s.fromPublic(this,t)},u.prototype.keyFromSecret=function(t){return s.fromSecret(this,t)},u.prototype.makeSignature=function(t){return t instanceof c?t:new c(this,t)},u.prototype.encodePoint=function(t){var e=t.getY().toArray("le",this.encodingLength);return e[this.encodingLength-1]|=t.getX().isOdd()?128:0,e},u.prototype.decodePoint=function(t){var e=(t=o.parseBytes(t)).length-1,r=t.slice(0,e).concat(-129&t[e]),n=0!=(128&t[e]),i=o.intFromLE(r);return this.curve.pointFromY(i,n)},u.prototype.encodeInt=function(t){return t.toArray("le",this.encodingLength)},u.prototype.decodeInt=function(t){return o.intFromLE(t)},u.prototype.isPoint=function(t){return t instanceof this.pointClass}},function(t,e,r){"use strict";var n=r(2).utils,i=n.assert,o=n.parseBytes,a=n.cachedProperty;function f(t,e){this.eddsa=t,this._secret=o(e.secret),t.isPoint(e.pub)?this._pub=e.pub:this._pubBytes=o(e.pub)}f.fromPublic=function(t,e){return e instanceof f?e:new f(t,{pub:e})},f.fromSecret=function(t,e){return e instanceof f?e:new f(t,{secret:e})},f.prototype.secret=function(){return this._secret},a(f,"pubBytes",function(){return this.eddsa.encodePoint(this.pub())}),a(f,"pub",function(){return this._pubBytes?this.eddsa.decodePoint(this._pubBytes):this.eddsa.g.mul(this.priv())}),a(f,"privBytes",function(){var t=this.eddsa,e=this.hash(),r=t.encodingLength-1,n=e.slice(0,t.encodingLength);return n[0]&=248,n[r]&=127,n[r]|=64,n}),a(f,"priv",function(){return this.eddsa.decodeInt(this.privBytes())}),a(f,"hash",function(){return this.eddsa.hash().update(this.secret()).digest()}),a(f,"messagePrefix",function(){return this.hash().slice(this.eddsa.encodingLength)}),f.prototype.sign=function(t){return i(this._secret,"KeyPair can only verify"),this.eddsa.sign(t,this)},f.prototype.verify=function(t,e){return this.eddsa.verify(t,e,this)},f.prototype.getSecret=function(t){return i(this._secret,"KeyPair is public only"),n.encode(this.secret(),t)},f.prototype.getPublic=function(t){return n.encode(this.pubBytes(),t)},t.exports=f},function(t,e,r){"use strict";var n=r(3),i=r(2).utils,o=i.assert,a=i.cachedProperty,f=i.parseBytes;function s(t,e){this.eddsa=t,"object"!=typeof e&&(e=f(e)),Array.isArray(e)&&(e={R:e.slice(0,t.encodingLength),S:e.slice(t.encodingLength)}),o(e.R&&e.S,"Signature without R or S"),t.isPoint(e.R)&&(this._R=e.R),e.S instanceof n&&(this._S=e.S),this._Rencoded=Array.isArray(e.R)?e.R:e.Rencoded,this._Sencoded=Array.isArray(e.S)?e.S:e.Sencoded}a(s,"S",function(){return this.eddsa.decodeInt(this.Sencoded())}),a(s,"R",function(){return this.eddsa.decodePoint(this.Rencoded())}),a(s,"Rencoded",function(){return this.eddsa.encodePoint(this.R())}),a(s,"Sencoded",function(){return this.eddsa.encodeInt(this.S())}),s.prototype.toBytes=function(){return this.Rencoded().concat(this.Sencoded())},s.prototype.toHex=function(){return i.encode(this.toBytes(),"hex").toUpperCase()},t.exports=s},function(t,e,r){const n=r(45),i=r(1).Buffer;function o(t,e){if("00"===t.slice(0,2))throw new Error("invalid RLP: extra zeros");return parseInt(t,e)}function a(t,e){if(t<56)return i.from([t+e]);var r=s(t),n=s(e+55+r.length/2);return i.from(n+r,"hex")}function f(t){return"0x"===t.slice(0,2)}function s(t){var e=t.toString(16);return e.length%2&&(e="0"+e),e}function c(t){if(!i.isBuffer(t))if("string"==typeof t)t=f(t)?i.from(function(t){return t.length%2&&(t="0"+t),t}(function(t){return"string"!=typeof t?t:f(t)?t.slice(2):t}(t)),"hex"):i.from(t);else if("number"==typeof t)t=t?function(t){var e=s(t);return i.from(e,"hex")}(t):i.from([]);else if(null===t||void 0===t)t=i.from([]);else{if(!t.toArray)throw new Error("invalid type");t=i.from(t.toArray())}return t}e.encode=function(t){if(t instanceof Array){for(var r=[],n=0;n<t.length;n++)r.push(e.encode(t[n]));var o=i.concat(r);return i.concat([a(o.length,192),o])}return 1===(t=c(t)).length&&t[0]<128?t:i.concat([a(t.length,128),t])},e.decode=function(t,e){if(!t||0===t.length)return i.from([]);var r=function t(e){var r,n,a,f,s;var c=[];var u=e[0];if(u<=127)return{data:e.slice(0,1),remainder:e.slice(1)};if(u<=183){if(r=u-127,a=128===u?i.from([]):e.slice(1,r),2===r&&a[0]<128)throw new Error("invalid rlp encoding: byte must be less 0x80");return{data:a,remainder:e.slice(r)}}if(u<=191){if(n=u-182,r=o(e.slice(1,n).toString("hex"),16),(a=e.slice(n,r+n)).length<r)throw new Error("invalid RLP");return{data:a,remainder:e.slice(r+n)}}if(u<=247){for(r=u-191,f=e.slice(1,r);f.length;)s=t(f),c.push(s.data),f=s.remainder;return{data:c,remainder:e.slice(r)}}n=u-246,r=o(e.slice(1,n).toString("hex"),16);var h=n+r;if(h>e.length)throw new Error("invalid rlp: total length is larger than the data");if(0===(f=e.slice(n,h)).length)throw new Error("invalid rlp, List has a invalid length");for(;f.length;)s=t(f),c.push(s.data),f=s.remainder;return{data:c,remainder:e.slice(h)}}(t=c(t));return e?r:(n.equal(r.remainder.length,0,"invalid remainder"),r.data)},e.getLength=function(t){if(!t||0===t.length)return i.from([]);var e=(t=c(t))[0];if(e<=127)return t.length;if(e<=183)return e-127;if(e<=191)return e-182;if(e<=247)return e-191;var r=e-246;return r+o(t.slice(1,r).toString("hex"),16)}},function(t,e,r){var n=r(47);t.exports=function(t){return"string"!=typeof t?t:n(t)?t.slice(2):t}},function(t,e,r){const n=r(125),i=r(9),o=r(127),a=r(128),f=a.incrementHexNumber,s=1e3,c=60*s;t.exports=class extends i{constructor(t={}){if(super(),!t.provider)throw new Error("RpcBlockTracker - no provider specified.");this._provider=t.provider,this._query=new n(t.provider),this._pollingInterval=t.pollingInterval||4*s,this._syncingTimeout=t.syncingTimeout||1*c,this._trackingBlock=null,this._trackingBlockTimestamp=null,this._currentBlock=null,this._isRunning=!1,this._performSync=this._performSync.bind(this),this._handleNewBlockNotification=this._handleNewBlockNotification.bind(this)}getTrackingBlock(){return this._trackingBlock}getCurrentBlock(){return this._currentBlock}async awaitCurrentBlock(){return this._currentBlock?this._currentBlock:(await new Promise(t=>this.once("latest",t)),this._currentBlock)}async start(t={}){this._isRunning||(this._isRunning=!0,t.fromBlock?await this._setTrackingBlock(await this._fetchBlockByNumber(t.fromBlock)):await this._setTrackingBlock(await this._fetchLatestBlock()),this._provider.on?await this._initSubscription():this._performSync().catch(t=>{t&&console.error(t)}))}async stop(){this._isRunning=!1,this._provider.on&&await this._removeSubscription()}async _setTrackingBlock(t){if(this._trackingBlock&&this._trackingBlock.hash===t.hash)return;const e=this._trackingBlockTimestamp,r=Date.now();e&&r-e>this._syncingTimeout?(this._trackingBlockTimestamp=null,await this._warpToLatest()):(this._trackingBlock=t,this._trackingBlockTimestamp=r,this.emit("block",t))}async _setCurrentBlock(t){if(this._currentBlock&&this._currentBlock.hash===t.hash)return;const e=this._currentBlock;this._currentBlock=t,this.emit("latest",t),this.emit("sync",{newBlock:t,oldBlock:e})}async _warpToLatest(){await this._setTrackingBlock(await this._fetchLatestBlock())}async _pollForNextBlock(){setTimeout(()=>this._performSync(),this._pollingInterval)}async _performSync(){if(!this._isRunning)return;const t=this.getTrackingBlock();if(!t)throw new Error("RpcBlockTracker - tracking block is missing");const e=f(t.number);try{const r=await this._fetchBlockByNumber(e);r?(await this._setTrackingBlock(r),this._performSync()):(await this._setCurrentBlock(t),this._pollForNextBlock())}catch(e){e.message.includes("index out of range")||e.message.includes("Couldn't find block by reference")?(await this._setCurrentBlock(t),this._pollForNextBlock()):(console.error(e),this._pollForNextBlock())}}async _handleNewBlockNotification(t,e){e.id==this._subscriptionId&&(t&&(this.emit("error",t),await this._removeSubscription()),await this._setTrackingBlock(await this._fetchBlockByNumber(e.result.number)))}async _initSubscription(){this._provider.on("data",this._handleNewBlockNotification);let t=await o(this._provider.sendAsync||this._provider.send)({jsonrpc:"2.0",id:(new Date).getTime(),method:"eth_subscribe",params:["newHeads"]});this._subscriptionId=t.result}async _removeSubscription(){if(!this._subscriptionId)throw new Error("Not subscribed.");this._provider.removeListener("data",this._handleNewBlockNotification),await o(this._provider.sendAsync||this._provider.send)({jsonrpc:"2.0",id:(new Date).getTime(),method:"eth_unsubscribe",params:[this._subscriptionId]}),delete this._subscriptionId}_fetchLatestBlock(){return o(this._query.getBlockByNumber).call(this._query,"latest",!0)}_fetchBlockByNumber(t){const e=a.formatHex(t);return o(this._query.getBlockByNumber).call(this._query,e,!0)}}},function(t,e,r){const n=r(24),i=r(126)();function o(t){this.currentProvider=t}function a(t){return function(){var e=[].slice.call(arguments),r=e.pop();this.sendAsync({method:t,params:e},r)}}function f(t,e){return function(){var r=[].slice.call(arguments),n=r.pop();r.length<t&&r.push("latest"),this.sendAsync({method:e,params:r},n)}}t.exports=o,o.prototype.getBalance=f(2,"eth_getBalance"),o.prototype.getCode=f(2,"eth_getCode"),o.prototype.getTransactionCount=f(2,"eth_getTransactionCount"),o.prototype.getStorageAt=f(3,"eth_getStorageAt"),o.prototype.call=f(2,"eth_call"),o.prototype.protocolVersion=a("eth_protocolVersion"),o.prototype.syncing=a("eth_syncing"),o.prototype.coinbase=a("eth_coinbase"),o.prototype.mining=a("eth_mining"),o.prototype.hashrate=a("eth_hashrate"),o.prototype.gasPrice=a("eth_gasPrice"),o.prototype.accounts=a("eth_accounts"),o.prototype.blockNumber=a("eth_blockNumber"),o.prototype.getBlockTransactionCountByHash=a("eth_getBlockTransactionCountByHash"),o.prototype.getBlockTransactionCountByNumber=a("eth_getBlockTransactionCountByNumber"),o.prototype.getUncleCountByBlockHash=a("eth_getUncleCountByBlockHash"),o.prototype.getUncleCountByBlockNumber=a("eth_getUncleCountByBlockNumber"),o.prototype.sign=a("eth_sign"),o.prototype.sendTransaction=a("eth_sendTransaction"),o.prototype.sendRawTransaction=a("eth_sendRawTransaction"),o.prototype.estimateGas=a("eth_estimateGas"),o.prototype.getBlockByHash=a("eth_getBlockByHash"),o.prototype.getBlockByNumber=a("eth_getBlockByNumber"),o.prototype.getTransactionByHash=a("eth_getTransactionByHash"),o.prototype.getTransactionByBlockHashAndIndex=a("eth_getTransactionByBlockHashAndIndex"),o.prototype.getTransactionByBlockNumberAndIndex=a("eth_getTransactionByBlockNumberAndIndex"),o.prototype.getTransactionReceipt=a("eth_getTransactionReceipt"),o.prototype.getUncleByBlockHashAndIndex=a("eth_getUncleByBlockHashAndIndex"),o.prototype.getUncleByBlockNumberAndIndex=a("eth_getUncleByBlockNumberAndIndex"),o.prototype.getCompilers=a("eth_getCompilers"),o.prototype.compileLLL=a("eth_compileLLL"),o.prototype.compileSolidity=a("eth_compileSolidity"),o.prototype.compileSerpent=a("eth_compileSerpent"),o.prototype.newFilter=a("eth_newFilter"),o.prototype.newBlockFilter=a("eth_newBlockFilter"),o.prototype.newPendingTransactionFilter=a("eth_newPendingTransactionFilter"),o.prototype.uninstallFilter=a("eth_uninstallFilter"),o.prototype.getFilterChanges=a("eth_getFilterChanges"),o.prototype.getFilterLogs=a("eth_getFilterLogs"),o.prototype.getLogs=a("eth_getLogs"),o.prototype.getWork=a("eth_getWork"),o.prototype.submitWork=a("eth_submitWork"),o.prototype.submitHashrate=a("eth_submitHashrate"),o.prototype.sendAsync=function(t,e){this.currentProvider.sendAsync(function(t){return n({id:i(),jsonrpc:"2.0",params:[]},t)}(t),function(t,r){if(!t&&r.error&&(t=new Error("EthQuery - RPC Error - "+r.error.message)),t)return e(t);e(null,r.result)})}},function(t,e){t.exports=function(t){var e=(t=t||{}).max||Number.MAX_SAFE_INTEGER,r=void 0!==t.start?t.start:Math.floor(Math.random()*e);return function(){return r%=e,r++}}},function(t,e,r){"use strict";var n=function(t,e,r){return function(){for(var n=this,i=new Array(arguments.length),o=0;o<arguments.length;o++)i[o]=arguments[o];return new e(function(e,o){i.push(function(t,n){if(t)o(t);else if(r.multiArgs){for(var i=new Array(arguments.length-1),a=1;a<arguments.length;a++)i[a-1]=arguments[a];e(i)}else e(n)}),t.apply(n,i)})}},i=t.exports=function(t,e,r){"function"!=typeof e&&(r=e,e=Promise),(r=r||{}).exclude=r.exclude||[/.+Sync$/];var i="function"==typeof t?function(){return r.excludeMain?t.apply(this,arguments):n(t,e,r).apply(this,arguments)}:{};return Object.keys(t).reduce(function(i,o){var a=t[o];return i[o]="function"==typeof a&&function(t){var e=function(e){return"string"==typeof e?t===e:e.test(t)};return r.include?r.include.some(e):!r.exclude.some(e)}(o)?n(a,e,r):a,i},i)};i.all=i},function(t,e,r){"use strict";const n=r(46);function i(t){let e=n.stripHexPrefix(t);for(;"0"===e[0];)e=e.substr(1);return`0x${e}`}t.exports={incrementHexNumber:function(t){return i(n.intToHex(parseInt(t,16)+1))},formatHex:i}},function(t,e,r){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var n=o(r(130)),i=o(r(158));function o(t){return t&&t.__esModule?t:{default:t}}e.default=(0,n.default)(i.default),t.exports=e.default},function(t,e,r){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.default=function(t){return function(e,r,o){return t(n.default,e,(0,i.default)(r),o)}};var n=o(r(131)),i=o(r(14));function o(t){return t&&t.__esModule?t:{default:t}}t.exports=e.default},function(t,e,r){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.default=function(t,e,r){((0,n.default)(t)?d:l)(t,(0,u.default)(e),r)};var n=h(r(25)),i=h(r(53)),o=h(r(135)),a=h(r(58)),f=h(r(27)),s=h(r(55)),c=h(r(56)),u=h(r(14));function h(t){return t&&t.__esModule?t:{default:t}}function d(t,e,r){r=(0,s.default)(r||f.default);var n=0,o=0,a=t.length;function u(t,e){t?r(t):++o!==a&&e!==i.default||r(null)}for(0===a&&r(null);n<a;n++)e(t[n],n,(0,c.default)(u))}var l=(0,a.default)(o.default,1/0);t.exports=e.default},function(t,e,r){var n=r(26),i=r(51),o="[object AsyncFunction]",a="[object Function]",f="[object GeneratorFunction]",s="[object Proxy]";t.exports=function(t){if(!i(t))return!1;var e=n(t);return e==a||e==f||e==o||e==s}},function(t,e,r){var n=r(48),i=Object.prototype,o=i.hasOwnProperty,a=i.toString,f=n?n.toStringTag:void 0;t.exports=function(t){var e=o.call(t,f),r=t[f];try{t[f]=void 0;var n=!0}catch(t){}var i=a.call(t);return n&&(e?t[f]=r:delete t[f]),i}},function(t,e){var r=Object.prototype.toString;t.exports=function(t){return r.call(t)}},function(t,e,r){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.default=function(t,e,r,o){(0,n.default)(e)(t,(0,i.default)(r),o)};var n=o(r(54)),i=o(r(14));function o(t){return t&&t.__esModule?t:{default:t}}t.exports=e.default},function(t,e,r){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.default=function(t){if((0,n.default)(t))return function(t){var e=-1,r=t.length;return function(){return++e<r?{value:t[e],key:e}:null}}(t);var e=(0,i.default)(t);return e?function(t){var e=-1;return function(){var r=t.next();return r.done?null:(e++,{value:r.value,key:e})}}(e):function(t){var e=(0,o.default)(t),r=-1,n=e.length;return function(){var i=e[++r];return r<n?{value:t[i],key:i}:null}}(t)};var n=a(r(25)),i=a(r(137)),o=a(r(138));function a(t){return t&&t.__esModule?t:{default:t}}t.exports=e.default},function(t,e,r){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.default=function(t){return n&&t[n]&&t[n]()};var n="function"==typeof Symbol&&Symbol.iterator;t.exports=e.default},function(t,e,r){var n=r(139),i=r(151),o=r(25);t.exports=function(t){return o(t)?n(t):i(t)}},function(t,e,r){var n=r(140),i=r(141),o=r(143),a=r(144),f=r(146),s=r(147),c=Object.prototype.hasOwnProperty;t.exports=function(t,e){var r=o(t),u=!r&&i(t),h=!r&&!u&&a(t),d=!r&&!u&&!h&&s(t),l=r||u||h||d,p=l?n(t.length,String):[],b=p.length;for(var y in t)!e&&!c.call(t,y)||l&&("length"==y||h&&("offset"==y||"parent"==y)||d&&("buffer"==y||"byteLength"==y||"byteOffset"==y)||f(y,b))||p.push(y);return p}},function(t,e){t.exports=function(t,e){for(var r=-1,n=Array(t);++r<t;)n[r]=e(r);return n}},function(t,e,r){var n=r(142),i=r(28),o=Object.prototype,a=o.hasOwnProperty,f=o.propertyIsEnumerable,s=n(function(){return arguments}())?n:function(t){return i(t)&&a.call(t,"callee")&&!f.call(t,"callee")};t.exports=s},function(t,e,r){var n=r(26),i=r(28),o="[object Arguments]";t.exports=function(t){return i(t)&&n(t)==o}},function(t,e){var r=Array.isArray;t.exports=r},function(t,e,r){(function(t){var n=r(49),i=r(145),o="object"==typeof e&&e&&!e.nodeType&&e,a=o&&"object"==typeof t&&t&&!t.nodeType&&t,f=a&&a.exports===o?n.Buffer:void 0,s=(f?f.isBuffer:void 0)||i;t.exports=s}).call(this,r(22)(t))},function(t,e){t.exports=function(){return!1}},function(t,e){var r=9007199254740991,n=/^(?:0|[1-9]\d*)$/;t.exports=function(t,e){var i=typeof t;return!!(e=null==e?r:e)&&("number"==i||"symbol"!=i&&n.test(t))&&t>-1&&t%1==0&&t<e}},function(t,e,r){var n=r(148),i=r(149),o=r(150),a=o&&o.isTypedArray,f=a?i(a):n;t.exports=f},function(t,e,r){var n=r(26),i=r(52),o=r(28),a={};a["[object Float32Array]"]=a["[object Float64Array]"]=a["[object Int8Array]"]=a["[object Int16Array]"]=a["[object Int32Array]"]=a["[object Uint8Array]"]=a["[object Uint8ClampedArray]"]=a["[object Uint16Array]"]=a["[object Uint32Array]"]=!0,a["[object Arguments]"]=a["[object Array]"]=a["[object ArrayBuffer]"]=a["[object Boolean]"]=a["[object DataView]"]=a["[object Date]"]=a["[object Error]"]=a["[object Function]"]=a["[object Map]"]=a["[object Number]"]=a["[object Object]"]=a["[object RegExp]"]=a["[object Set]"]=a["[object String]"]=a["[object WeakMap]"]=!1,t.exports=function(t){return o(t)&&i(t.length)&&!!a[n(t)]}},function(t,e){t.exports=function(t){return function(e){return t(e)}}},function(t,e,r){(function(t){var n=r(50),i="object"==typeof e&&e&&!e.nodeType&&e,o=i&&"object"==typeof t&&t&&!t.nodeType&&t,a=o&&o.exports===i&&n.process,f=function(){try{var t=o&&o.require&&o.require("util").types;return t||a&&a.binding&&a.binding("util")}catch(t){}}();t.exports=f}).call(this,r(22)(t))},function(t,e,r){var n=r(152),i=r(153),o=Object.prototype.hasOwnProperty;t.exports=function(t){if(!n(t))return i(t);var e=[];for(var r in Object(t))o.call(t,r)&&"constructor"!=r&&e.push(r);return e}},function(t,e){var r=Object.prototype;t.exports=function(t){var e=t&&t.constructor;return t===("function"==typeof e&&e.prototype||r)}},function(t,e,r){var n=r(154)(Object.keys,Object);t.exports=n},function(t,e){t.exports=function(t,e){return function(r){return t(e(r))}}},function(t,e,r){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.default=function(t){return(0,i.default)(function(e,r){var i;try{i=t.apply(this,e)}catch(t){return r(t)}(0,n.default)(i)&&"function"==typeof i.then?i.then(function(t){f(r,null,t)},function(t){f(r,t.message?t:new Error(t))}):r(null,i)})};var n=a(r(51)),i=a(r(156)),o=a(r(157));function a(t){return t&&t.__esModule?t:{default:t}}function f(t,e,r){try{t(e,r)}catch(t){(0,o.default)(s,t)}}function s(t){throw t}t.exports=e.default},function(t,e,r){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.default=function(t){return function(){var e=(0,n.default)(arguments),r=e.pop();t.call(this,e,r)}};var n=function(t){return t&&t.__esModule?t:{default:t}}(r(57));t.exports=e.default},function(t,e,r){"use strict";(function(t,n){Object.defineProperty(e,"__esModule",{value:!0}),e.hasNextTick=e.hasSetImmediate=void 0,e.fallback=s,e.wrap=c;var i=function(t){return t&&t.__esModule?t:{default:t}}(r(57));var o,a=e.hasSetImmediate="function"==typeof t&&t,f=e.hasNextTick="object"==typeof n&&"function"==typeof n.nextTick;function s(t){setTimeout(t,0)}function c(t){return function(e){var r=(0,i.default)(arguments,1);t(function(){e.apply(null,r)})}}o=a?t:f?n.nextTick:s,e.default=c(o)}).call(this,r(34).setImmediate,r(6))},function(t,e,r){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.default=function(t,e,r,o){o=o||n.default,e=e||[];var a=[],f=0,s=(0,i.default)(r);t(e,function(t,e,r){var n=f++;s(t,function(t,e){a[n]=e,r(t)})},function(t){o(t,a)})};var n=o(r(27)),i=o(r(14));function o(t){return t&&t.__esModule?t:{default:t}}t.exports=e.default},function(t,e,r){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var n=o(r(160)),i=o(r(58));function o(t){return t&&t.__esModule?t:{default:t}}e.default=(0,i.default)(n.default,1),t.exports=e.default},function(t,e,r){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.default=function(t,e,r,a){(0,n.default)(e)(t,(0,i.default)((0,o.default)(r)),a)};var n=a(r(54)),i=a(r(161)),o=a(r(14));function a(t){return t&&t.__esModule?t:{default:t}}t.exports=e.default},function(t,e,r){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.default=function(t){return function(e,r,n){return t(e,n)}},t.exports=e.default},function(t,e,r){const n=r(9).EventEmitter,i=r(15).inherits;function o(){n.call(this),this.isLocked=!0}t.exports=o,i(o,n),o.prototype.go=function(){this.isLocked=!1,this.emit("unlock")},o.prototype.stop=function(){this.isLocked=!0,this.emit("lock")},o.prototype.await=function(t){const e=this;e.isLocked?e.once("unlock",t):setTimeout(t)}},function(t,e,r){const n=r(164);function i(t){return"never"!==f(t)}function o(t){var e=a(t);return e>=t.params.length?t.params:"eth_getBlockByNumber"===t.method?t.params.slice(1):t.params.slice(0,e)}function a(t){switch(t.method){case"eth_getStorageAt":return 2;case"eth_getBalance":case"eth_getCode":case"eth_getTransactionCount":case"eth_call":case"eth_estimateGas":return 1;case"eth_getBlockByNumber":return 0;default:return}}function f(t){switch(t.method){case"web3_clientVersion":case"web3_sha3":case"eth_protocolVersion":case"eth_getBlockTransactionCountByHash":case"eth_getUncleCountByBlockHash":case"eth_getCode":case"eth_getBlockByHash":case"eth_getTransactionByHash":case"eth_getTransactionByBlockHashAndIndex":case"eth_getTransactionReceipt":case"eth_getUncleByBlockHashAndIndex":case"eth_getCompilers":case"eth_compileLLL":case"eth_compileSolidity":case"eth_compileSerpent":case"shh_version":return"perma";case"eth_getBlockByNumber":case"eth_getBlockTransactionCountByNumber":case"eth_getUncleCountByBlockNumber":case"eth_getTransactionByBlockNumberAndIndex":case"eth_getUncleByBlockNumberAndIndex":return"fork";case"eth_gasPrice":case"eth_blockNumber":case"eth_getBalance":case"eth_getStorageAt":case"eth_getTransactionCount":case"eth_call":case"eth_estimateGas":case"eth_getFilterLogs":case"eth_getLogs":case"net_peerCount":return"block";case"net_version":case"net_peerCount":case"net_listening":case"eth_syncing":case"eth_sign":case"eth_coinbase":case"eth_mining":case"eth_hashrate":case"eth_accounts":case"eth_sendTransaction":case"eth_sendRawTransaction":case"eth_newFilter":case"eth_newBlockFilter":case"eth_newPendingTransactionFilter":case"eth_uninstallFilter":case"eth_getFilterChanges":case"eth_getWork":case"eth_submitWork":case"eth_submitHashrate":case"db_putString":case"db_getString":case"db_putHex":case"db_getHex":case"shh_post":case"shh_newIdentity":case"shh_hasIdentity":case"shh_newGroup":case"shh_addToGroup":case"shh_newFilter":case"shh_uninstallFilter":case"shh_getFilterChanges":case"shh_getMessages":return"never"}}t.exports={cacheIdentifierForPayload:function(t,e={}){if(!i(t))return null;const{includeBlockRef:r}=e,a=r?t.params:o(t);return t.method+":"+n(a)},canCache:i,blockTagForPayload:function(t){var e=a(t);if(e>=t.params.length)return null;return t.params[e]},paramsWithoutBlockTag:o,blockTagParamIndex:a,cacheTypeForPayload:f}},function(t,e,r){var n="undefined"!=typeof JSON?JSON:r(165);t.exports=function(t,e){e||(e={}),"function"==typeof e&&(e={cmp:e});var r=e.space||"";"number"==typeof r&&(r=Array(r+1).join(" "));var a="boolean"==typeof e.cycles&&e.cycles,f=e.replacer||function(t,e){return e},s=e.cmp&&function(t){return function(e){return function(r,n){var i={key:r,value:e[r]},o={key:n,value:e[n]};return t(i,o)}}}(e.cmp),c=[];return function t(e,u,h,d){var l=r?"\n"+new Array(d+1).join(r):"",p=r?": ":":";if(h&&h.toJSON&&"function"==typeof h.toJSON&&(h=h.toJSON()),void 0!==(h=f.call(e,u,h))){if("object"!=typeof h||null===h)return n.stringify(h);if(i(h)){for(var b=[],y=0;y<h.length;y++){var v=t(h,y,h[y],d+1)||n.stringify(null);b.push(l+r+v)}return"["+b.join(",")+l+"]"}if(-1!==c.indexOf(h)){if(a)return n.stringify("__cycle__");throw new TypeError("Converting circular structure to JSON")}c.push(h);var g=o(h).sort(s&&s(h));for(b=[],y=0;y<g.length;y++){var m=t(h,u=g[y],h[u],d+1);if(m){var _=n.stringify(u)+p+m;b.push(l+r+_)}}return c.splice(c.indexOf(h),1),"{"+b.join(",")+l+"}"}}({"":t},"",t,0)};var i=Array.isArray||function(t){return"[object Array]"==={}.toString.call(t)},o=Object.keys||function(t){var e=Object.prototype.hasOwnProperty||function(){return!0},r=[];for(var n in t)e.call(t,n)&&r.push(n);return r}},function(t,e,r){e.parse=r(166),e.stringify=r(167)},function(t,e){var r,n,i,o,a={'"':'"',"\\":"\\","/":"/",b:"\b",f:"\f",n:"\n",r:"\r",t:"\t"},f=function(t){throw{name:"SyntaxError",message:t,at:r,text:i}},s=function(t){return t&&t!==n&&f("Expected '"+t+"' instead of '"+n+"'"),n=i.charAt(r),r+=1,n},c=function(){var t,e="";for("-"===n&&(e="-",s("-"));n>="0"&&n<="9";)e+=n,s();if("."===n)for(e+=".";s()&&n>="0"&&n<="9";)e+=n;if("e"===n||"E"===n)for(e+=n,s(),"-"!==n&&"+"!==n||(e+=n,s());n>="0"&&n<="9";)e+=n,s();if(t=+e,isFinite(t))return t;f("Bad number")},u=function(){var t,e,r,i="";if('"'===n)for(;s();){if('"'===n)return s(),i;if("\\"===n)if(s(),"u"===n){for(r=0,e=0;e<4&&(t=parseInt(s(),16),isFinite(t));e+=1)r=16*r+t;i+=String.fromCharCode(r)}else{if("string"!=typeof a[n])break;i+=a[n]}else i+=n}f("Bad string")},h=function(){for(;n&&n<=" ";)s()};o=function(){switch(h(),n){case"{":return function(){var t,e={};if("{"===n){if(s("{"),h(),"}"===n)return s("}"),e;for(;n;){if(t=u(),h(),s(":"),Object.hasOwnProperty.call(e,t)&&f('Duplicate key "'+t+'"'),e[t]=o(),h(),"}"===n)return s("}"),e;s(","),h()}}f("Bad object")}();case"[":return function(){var t=[];if("["===n){if(s("["),h(),"]"===n)return s("]"),t;for(;n;){if(t.push(o()),h(),"]"===n)return s("]"),t;s(","),h()}}f("Bad array")}();case'"':return u();case"-":return c();default:return n>="0"&&n<="9"?c():function(){switch(n){case"t":return s("t"),s("r"),s("u"),s("e"),!0;case"f":return s("f"),s("a"),s("l"),s("s"),s("e"),!1;case"n":return s("n"),s("u"),s("l"),s("l"),null}f("Unexpected '"+n+"'")}()}},t.exports=function(t,e){var a;return i=t,r=0,n=" ",a=o(),h(),n&&f("Syntax error"),"function"==typeof e?function t(r,n){var i,o,a=r[n];if(a&&"object"==typeof a)for(i in a)Object.prototype.hasOwnProperty.call(a,i)&&(void 0!==(o=t(a,i))?a[i]=o:delete a[i]);return e.call(r,n,a)}({"":a},""):a}},function(t,e){var r,n,i,o=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,a={"\b":"\\b","\t":"\\t","\n":"\\n","\f":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"};function f(t){return o.lastIndex=0,o.test(t)?'"'+t.replace(o,function(t){var e=a[t];return"string"==typeof e?e:"\\u"+("0000"+t.charCodeAt(0).toString(16)).slice(-4)})+'"':'"'+t+'"'}t.exports=function(t,e,o){var a;if(r="",n="","number"==typeof o)for(a=0;a<o;a+=1)n+=" ";else"string"==typeof o&&(n=o);if(i=e,e&&"function"!=typeof e&&("object"!=typeof e||"number"!=typeof e.length))throw new Error("JSON.stringify");return function t(e,o){var a,s,c,u,h,d=r,l=o[e];switch(l&&"object"==typeof l&&"function"==typeof l.toJSON&&(l=l.toJSON(e)),"function"==typeof i&&(l=i.call(o,e,l)),typeof l){case"string":return f(l);case"number":return isFinite(l)?String(l):"null";case"boolean":case"null":return String(l);case"object":if(!l)return"null";if(r+=n,h=[],"[object Array]"===Object.prototype.toString.apply(l)){for(u=l.length,a=0;a<u;a+=1)h[a]=t(a,l)||"null";return c=0===h.length?"[]":r?"[\n"+r+h.join(",\n"+r)+"\n"+d+"]":"["+h.join(",")+"]",r=d,c}if(i&&"object"==typeof i)for(u=i.length,a=0;a<u;a+=1)"string"==typeof(s=i[a])&&(c=t(s,l))&&h.push(f(s)+(r?": ":":")+c);else for(s in l)Object.prototype.hasOwnProperty.call(l,s)&&(c=t(s,l))&&h.push(f(s)+(r?": ":":")+c);return c=0===h.length?"{}":r?"{\n"+r+h.join(",\n"+r)+"\n"+d+"}":"{"+h.join(",")+"}",r=d,c}}("",{"":t})}},function(t,e){const r=3;t.exports=function(){var t=(new Date).getTime()*Math.pow(10,r),e=Math.floor(Math.random()*Math.pow(10,r));return t+e}},function(t,e,r){"use strict";var n=r(170),i=r(171),o=r(172),a=r(24);function f(t,e,r){var n=t;return i(e)?(r=e,"string"==typeof t&&(n={uri:t})):n=a(e,{uri:t}),n.callback=r,n}function s(t,e,r){return c(e=f(t,e,r))}function c(t){if(void 0===t.callback)throw new Error("callback argument missing");var e=!1,r=function(r,n,i){e||(e=!0,t.callback(r,n,i))};function n(t){return clearTimeout(u),t instanceof Error||(t=new Error(""+(t||"Unknown XMLHttpRequest Error"))),t.statusCode=0,r(t,v)}function i(){if(!f){var e;clearTimeout(u),e=t.useXDR&&void 0===c.status?200:1223===c.status?204:c.status;var n=v,i=null;return 0!==e?(n={body:function(){var t=void 0;if(t=c.response?c.response:c.responseText||function(t){try{if("document"===t.responseType)return t.responseXML;var e=t.responseXML&&"parsererror"===t.responseXML.documentElement.nodeName;if(""===t.responseType&&!e)return t.responseXML}catch(t){}return null}(c),y)try{t=JSON.parse(t)}catch(t){}return t}(),statusCode:e,method:d,headers:{},url:h,rawRequest:c},c.getAllResponseHeaders&&(n.headers=o(c.getAllResponseHeaders()))):i=new Error("Internal XMLHttpRequest Error"),r(i,n,n.body)}}var a,f,c=t.xhr||null;c||(c=t.cors||t.useXDR?new s.XDomainRequest:new s.XMLHttpRequest);var u,h=c.url=t.uri||t.url,d=c.method=t.method||"GET",l=t.body||t.data,p=c.headers=t.headers||{},b=!!t.sync,y=!1,v={body:void 0,headers:{},statusCode:0,method:d,url:h,rawRequest:c};if("json"in t&&!1!==t.json&&(y=!0,p.accept||p.Accept||(p.Accept="application/json"),"GET"!==d&&"HEAD"!==d&&(p["content-type"]||p["Content-Type"]||(p["Content-Type"]="application/json"),l=JSON.stringify(!0===t.json?l:t.json))),c.onreadystatechange=function(){4===c.readyState&&setTimeout(i,0)},c.onload=i,c.onerror=n,c.onprogress=function(){},c.onabort=function(){f=!0},c.ontimeout=n,c.open(d,h,!b,t.username,t.password),b||(c.withCredentials=!!t.withCredentials),!b&&t.timeout>0&&(u=setTimeout(function(){if(!f){f=!0,c.abort("timeout");var t=new Error("XMLHttpRequest timeout");t.code="ETIMEDOUT",n(t)}},t.timeout)),c.setRequestHeader)for(a in p)p.hasOwnProperty(a)&&c.setRequestHeader(a,p[a]);else if(t.headers&&!function(t){for(var e in t)if(t.hasOwnProperty(e))return!1;return!0}(t.headers))throw new Error("Headers cannot be set on an XDomainRequest object");return"responseType"in t&&(c.responseType=t.responseType),"beforeSend"in t&&"function"==typeof t.beforeSend&&t.beforeSend(c),c.send(l||null),c}t.exports=s,t.exports.default=s,s.XMLHttpRequest=n.XMLHttpRequest||function(){},s.XDomainRequest="withCredentials"in new s.XMLHttpRequest?s.XMLHttpRequest:n.XDomainRequest,function(t,e){for(var r=0;r<t.length;r++)e(t[r])}(["get","put","post","patch","head","delete"],function(t){s["delete"===t?"del":t]=function(e,r,n){return(r=f(e,r,n)).method=t.toUpperCase(),c(r)}})},function(t,e,r){(function(e){var r;r="undefined"!=typeof window?window:void 0!==e?e:"undefined"!=typeof self?self:{},t.exports=r}).call(this,r(4))},function(t,e){t.exports=function(t){var e=r.call(t);return"[object Function]"===e||"function"==typeof t&&"[object RegExp]"!==e||"undefined"!=typeof window&&(t===window.setTimeout||t===window.alert||t===window.confirm||t===window.prompt)};var r=Object.prototype.toString},function(t,e,r){var n=r(173),i=r(174);t.exports=function(t){if(!t)return{};var e={};return i(n(t).split("\n"),function(t){var r=t.indexOf(":"),i=n(t.slice(0,r)).toLowerCase(),o=n(t.slice(r+1));void 0===e[i]?e[i]=o:!function(t){return"[object Array]"===Object.prototype.toString.call(t)}(e[i])?e[i]=[e[i],o]:e[i].push(o)}),e}},function(t,e){(e=t.exports=function(t){return t.replace(/^\s*|\s*$/g,"")}).left=function(t){return t.replace(/^\s*/,"")},e.right=function(t){return t.replace(/\s*$/,"")}},function(t,e,r){"use strict";var n=r(175),i=Object.prototype.toString,o=Object.prototype.hasOwnProperty;t.exports=function(t,e,r){if(!n(e))throw new TypeError("iterator must be a function");var a;arguments.length>=3&&(a=r),"[object Array]"===i.call(t)?function(t,e,r){for(var n=0,i=t.length;n<i;n++)o.call(t,n)&&(null==r?e(t[n],n,t):e.call(r,t[n],n,t))}(t,e,a):"string"==typeof t?function(t,e,r){for(var n=0,i=t.length;n<i;n++)null==r?e(t.charAt(n),n,t):e.call(r,t.charAt(n),n,t)}(t,e,a):function(t,e,r){for(var n in t)o.call(t,n)&&(null==r?e(t[n],n,t):e.call(r,t[n],n,t))}(t,e,a)}},function(t,e,r){"use strict";var n=Function.prototype.toString,i=/^\s*class\b/,o=function(t){try{var e=n.call(t);return i.test(e)}catch(t){return!1}},a=Object.prototype.toString,f="function"==typeof Symbol&&"symbol"==typeof Symbol.toStringTag;t.exports=function(t){if(!t)return!1;if("function"!=typeof t&&"object"!=typeof t)return!1;if("function"==typeof t&&!t.prototype)return!0;if(f)return function(t){try{return!o(t)&&(n.call(t),!0)}catch(t){return!1}}(t);if(o(t))return!1;var e=a.call(t);return"[object Function]"===e||"[object GeneratorFunction]"===e}},function(t,e){},function(t,e,r){const n=r(29);function i(){}t.exports=i,i.prototype.setEngine=function(t){const e=this;e.engine=t,t.on("block",function(t){e.currentBlock=t})},i.prototype.handleRequest=function(t,e,r){throw new Error("Subproviders should override `handleRequest`.")},i.prototype.emitPayload=function(t,e){this.engine.sendAsync(n(t),e)}},function(t,e,r){t.exports=r(179)},function(t,e,r){var n=r(0),i=function(t,e,r){if(!(this instanceof i))return new i(t,e,r);this.message=t,this.code=e,void 0!==r&&(this.data=r)};n(i,Error);var o=function(){if(!(this instanceof o))return new o;i.call(this,"Parse error",-32700)};n(o,i);var a=function(){if(!(this instanceof a))return new a;i.call(this,"Invalid Request",-32600)};n(a,i);var f=function(){if(!(this instanceof f))return new f;i.call(this,"Method not found",-32601)};n(f,i);var s=function(){if(!(this instanceof s))return new s;i.call(this,"Invalid params",-32602)};n(s,i);var c=function(t){var e;if(!(this instanceof c))return new c(t);e=t&&t.message?t.message:"Internal error",i.call(this,e,-32603)};n(c,i);var u=function(t){if(t<-32099||t>-32e3)throw new Error("Invalid error code");if(!(this instanceof u))return new u(t);i.call(this,"Server error",t)};n(u,i),i.ParseError=o,i.InvalidRequest=a,i.MethodNotFound=f,i.InvalidParams=s,i.InternalError=c,i.ServerError=u,t.exports=i}]);
//# sourceMappingURL=walletconnect-web3-provider.js.map

/***/ }),

/***/ "6853":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

var utils = __webpack_require__("be7f");

var MAXBITS = 15;
var ENOUGH_LENS = 852;
var ENOUGH_DISTS = 592;
//var ENOUGH = (ENOUGH_LENS+ENOUGH_DISTS);

var CODES = 0;
var LENS = 1;
var DISTS = 2;

var lbase = [ /* Length codes 257..285 base */
  3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31,
  35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 0, 0
];

var lext = [ /* Length codes 257..285 extra */
  16, 16, 16, 16, 16, 16, 16, 16, 17, 17, 17, 17, 18, 18, 18, 18,
  19, 19, 19, 19, 20, 20, 20, 20, 21, 21, 21, 21, 16, 72, 78
];

var dbase = [ /* Distance codes 0..29 base */
  1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193,
  257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145,
  8193, 12289, 16385, 24577, 0, 0
];

var dext = [ /* Distance codes 0..29 extra */
  16, 16, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21, 22, 22,
  23, 23, 24, 24, 25, 25, 26, 26, 27, 27,
  28, 28, 29, 29, 64, 64
];

module.exports = function inflate_table(type, lens, lens_index, codes, table, table_index, work, opts)
{
  var bits = opts.bits;
      //here = opts.here; /* table entry for duplication */

  var len = 0;               /* a code's length in bits */
  var sym = 0;               /* index of code symbols */
  var min = 0, max = 0;          /* minimum and maximum code lengths */
  var root = 0;              /* number of index bits for root table */
  var curr = 0;              /* number of index bits for current table */
  var drop = 0;              /* code bits to drop for sub-table */
  var left = 0;                   /* number of prefix codes available */
  var used = 0;              /* code entries in table used */
  var huff = 0;              /* Huffman code */
  var incr;              /* for incrementing code, index */
  var fill;              /* index for replicating entries */
  var low;               /* low bits for current root entry */
  var mask;              /* mask for low root bits */
  var next;             /* next available space in table */
  var base = null;     /* base value table to use */
  var base_index = 0;
//  var shoextra;    /* extra bits table to use */
  var end;                    /* use base and extra for symbol > end */
  var count = new utils.Buf16(MAXBITS + 1); //[MAXBITS+1];    /* number of codes of each length */
  var offs = new utils.Buf16(MAXBITS + 1); //[MAXBITS+1];     /* offsets in table for each length */
  var extra = null;
  var extra_index = 0;

  var here_bits, here_op, here_val;

  /*
   Process a set of code lengths to create a canonical Huffman code.  The
   code lengths are lens[0..codes-1].  Each length corresponds to the
   symbols 0..codes-1.  The Huffman code is generated by first sorting the
   symbols by length from short to long, and retaining the symbol order
   for codes with equal lengths.  Then the code starts with all zero bits
   for the first code of the shortest length, and the codes are integer
   increments for the same length, and zeros are appended as the length
   increases.  For the deflate format, these bits are stored backwards
   from their more natural integer increment ordering, and so when the
   decoding tables are built in the large loop below, the integer codes
   are incremented backwards.

   This routine assumes, but does not check, that all of the entries in
   lens[] are in the range 0..MAXBITS.  The caller must assure this.
   1..MAXBITS is interpreted as that code length.  zero means that that
   symbol does not occur in this code.

   The codes are sorted by computing a count of codes for each length,
   creating from that a table of starting indices for each length in the
   sorted table, and then entering the symbols in order in the sorted
   table.  The sorted table is work[], with that space being provided by
   the caller.

   The length counts are used for other purposes as well, i.e. finding
   the minimum and maximum length codes, determining if there are any
   codes at all, checking for a valid set of lengths, and looking ahead
   at length counts to determine sub-table sizes when building the
   decoding tables.
   */

  /* accumulate lengths for codes (assumes lens[] all in 0..MAXBITS) */
  for (len = 0; len <= MAXBITS; len++) {
    count[len] = 0;
  }
  for (sym = 0; sym < codes; sym++) {
    count[lens[lens_index + sym]]++;
  }

  /* bound code lengths, force root to be within code lengths */
  root = bits;
  for (max = MAXBITS; max >= 1; max--) {
    if (count[max] !== 0) { break; }
  }
  if (root > max) {
    root = max;
  }
  if (max === 0) {                     /* no symbols to code at all */
    //table.op[opts.table_index] = 64;  //here.op = (var char)64;    /* invalid code marker */
    //table.bits[opts.table_index] = 1;   //here.bits = (var char)1;
    //table.val[opts.table_index++] = 0;   //here.val = (var short)0;
    table[table_index++] = (1 << 24) | (64 << 16) | 0;


    //table.op[opts.table_index] = 64;
    //table.bits[opts.table_index] = 1;
    //table.val[opts.table_index++] = 0;
    table[table_index++] = (1 << 24) | (64 << 16) | 0;

    opts.bits = 1;
    return 0;     /* no symbols, but wait for decoding to report error */
  }
  for (min = 1; min < max; min++) {
    if (count[min] !== 0) { break; }
  }
  if (root < min) {
    root = min;
  }

  /* check for an over-subscribed or incomplete set of lengths */
  left = 1;
  for (len = 1; len <= MAXBITS; len++) {
    left <<= 1;
    left -= count[len];
    if (left < 0) {
      return -1;
    }        /* over-subscribed */
  }
  if (left > 0 && (type === CODES || max !== 1)) {
    return -1;                      /* incomplete set */
  }

  /* generate offsets into symbol table for each length for sorting */
  offs[1] = 0;
  for (len = 1; len < MAXBITS; len++) {
    offs[len + 1] = offs[len] + count[len];
  }

  /* sort symbols by length, by symbol order within each length */
  for (sym = 0; sym < codes; sym++) {
    if (lens[lens_index + sym] !== 0) {
      work[offs[lens[lens_index + sym]]++] = sym;
    }
  }

  /*
   Create and fill in decoding tables.  In this loop, the table being
   filled is at next and has curr index bits.  The code being used is huff
   with length len.  That code is converted to an index by dropping drop
   bits off of the bottom.  For codes where len is less than drop + curr,
   those top drop + curr - len bits are incremented through all values to
   fill the table with replicated entries.

   root is the number of index bits for the root table.  When len exceeds
   root, sub-tables are created pointed to by the root entry with an index
   of the low root bits of huff.  This is saved in low to check for when a
   new sub-table should be started.  drop is zero when the root table is
   being filled, and drop is root when sub-tables are being filled.

   When a new sub-table is needed, it is necessary to look ahead in the
   code lengths to determine what size sub-table is needed.  The length
   counts are used for this, and so count[] is decremented as codes are
   entered in the tables.

   used keeps track of how many table entries have been allocated from the
   provided *table space.  It is checked for LENS and DIST tables against
   the constants ENOUGH_LENS and ENOUGH_DISTS to guard against changes in
   the initial root table size constants.  See the comments in inftrees.h
   for more information.

   sym increments through all symbols, and the loop terminates when
   all codes of length max, i.e. all codes, have been processed.  This
   routine permits incomplete codes, so another loop after this one fills
   in the rest of the decoding tables with invalid code markers.
   */

  /* set up for code type */
  // poor man optimization - use if-else instead of switch,
  // to avoid deopts in old v8
  if (type === CODES) {
    base = extra = work;    /* dummy value--not used */
    end = 19;

  } else if (type === LENS) {
    base = lbase;
    base_index -= 257;
    extra = lext;
    extra_index -= 257;
    end = 256;

  } else {                    /* DISTS */
    base = dbase;
    extra = dext;
    end = -1;
  }

  /* initialize opts for loop */
  huff = 0;                   /* starting code */
  sym = 0;                    /* starting code symbol */
  len = min;                  /* starting code length */
  next = table_index;              /* current table to fill in */
  curr = root;                /* current table index bits */
  drop = 0;                   /* current bits to drop from code for index */
  low = -1;                   /* trigger new sub-table when len > root */
  used = 1 << root;          /* use root table entries */
  mask = used - 1;            /* mask for comparing low */

  /* check available table space */
  if ((type === LENS && used > ENOUGH_LENS) ||
    (type === DISTS && used > ENOUGH_DISTS)) {
    return 1;
  }

  /* process all codes and make table entries */
  for (;;) {
    /* create table entry */
    here_bits = len - drop;
    if (work[sym] < end) {
      here_op = 0;
      here_val = work[sym];
    }
    else if (work[sym] > end) {
      here_op = extra[extra_index + work[sym]];
      here_val = base[base_index + work[sym]];
    }
    else {
      here_op = 32 + 64;         /* end of block */
      here_val = 0;
    }

    /* replicate for those indices with low len bits equal to huff */
    incr = 1 << (len - drop);
    fill = 1 << curr;
    min = fill;                 /* save offset to next table */
    do {
      fill -= incr;
      table[next + (huff >> drop) + fill] = (here_bits << 24) | (here_op << 16) | here_val |0;
    } while (fill !== 0);

    /* backwards increment the len-bit code huff */
    incr = 1 << (len - 1);
    while (huff & incr) {
      incr >>= 1;
    }
    if (incr !== 0) {
      huff &= incr - 1;
      huff += incr;
    } else {
      huff = 0;
    }

    /* go to next symbol, update count, len */
    sym++;
    if (--count[len] === 0) {
      if (len === max) { break; }
      len = lens[lens_index + work[sym]];
    }

    /* create new sub-table if needed */
    if (len > root && (huff & mask) !== low) {
      /* if first time, transition to sub-tables */
      if (drop === 0) {
        drop = root;
      }

      /* increment past last table */
      next += min;            /* here min is 1 << curr */

      /* determine length of next table */
      curr = len - drop;
      left = 1 << curr;
      while (curr + drop < max) {
        left -= count[curr + drop];
        if (left <= 0) { break; }
        curr++;
        left <<= 1;
      }

      /* check for enough space */
      used += 1 << curr;
      if ((type === LENS && used > ENOUGH_LENS) ||
        (type === DISTS && used > ENOUGH_DISTS)) {
        return 1;
      }

      /* point entry in root table to sub-table */
      low = huff & mask;
      /*table.op[low] = curr;
      table.bits[low] = root;
      table.val[low] = next - opts.table_index;*/
      table[low] = (root << 24) | (curr << 16) | (next - table_index) |0;
    }
  }

  /* fill in remaining table entry if code is incomplete (guaranteed to have
   at most one remaining entry, since if the code is incomplete, the
   maximum code length that was allowed to get this far is one bit) */
  if (huff !== 0) {
    //table.op[next + huff] = 64;            /* invalid code marker */
    //table.bits[next + huff] = len - drop;
    //table.val[next + huff] = 0;
    table[next + huff] = ((len - drop) << 24) | (64 << 16) |0;
  }

  /* set return parameters */
  //opts.table_index += used;
  opts.bits = root;
  return 0;
};


/***/ }),

/***/ "6b75":
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(Buffer, process) {
/* eslint camelcase: "off" */

var assert = __webpack_require__("f654");

var Zstream = __webpack_require__("8936");
var zlib_deflate = __webpack_require__("a177");
var zlib_inflate = __webpack_require__("9e6e");
var constants = __webpack_require__("2ceb");

for (var key in constants) {
  exports[key] = constants[key];
}

// zlib modes
exports.NONE = 0;
exports.DEFLATE = 1;
exports.INFLATE = 2;
exports.GZIP = 3;
exports.GUNZIP = 4;
exports.DEFLATERAW = 5;
exports.INFLATERAW = 6;
exports.UNZIP = 7;

var GZIP_HEADER_ID1 = 0x1f;
var GZIP_HEADER_ID2 = 0x8b;

/**
 * Emulate Node's zlib C++ layer for use by the JS layer in index.js
 */
function Zlib(mode) {
  if (typeof mode !== 'number' || mode < exports.DEFLATE || mode > exports.UNZIP) {
    throw new TypeError('Bad argument');
  }

  this.dictionary = null;
  this.err = 0;
  this.flush = 0;
  this.init_done = false;
  this.level = 0;
  this.memLevel = 0;
  this.mode = mode;
  this.strategy = 0;
  this.windowBits = 0;
  this.write_in_progress = false;
  this.pending_close = false;
  this.gzip_id_bytes_read = 0;
}

Zlib.prototype.close = function () {
  if (this.write_in_progress) {
    this.pending_close = true;
    return;
  }

  this.pending_close = false;

  assert(this.init_done, 'close before init');
  assert(this.mode <= exports.UNZIP);

  if (this.mode === exports.DEFLATE || this.mode === exports.GZIP || this.mode === exports.DEFLATERAW) {
    zlib_deflate.deflateEnd(this.strm);
  } else if (this.mode === exports.INFLATE || this.mode === exports.GUNZIP || this.mode === exports.INFLATERAW || this.mode === exports.UNZIP) {
    zlib_inflate.inflateEnd(this.strm);
  }

  this.mode = exports.NONE;

  this.dictionary = null;
};

Zlib.prototype.write = function (flush, input, in_off, in_len, out, out_off, out_len) {
  return this._write(true, flush, input, in_off, in_len, out, out_off, out_len);
};

Zlib.prototype.writeSync = function (flush, input, in_off, in_len, out, out_off, out_len) {
  return this._write(false, flush, input, in_off, in_len, out, out_off, out_len);
};

Zlib.prototype._write = function (async, flush, input, in_off, in_len, out, out_off, out_len) {
  assert.equal(arguments.length, 8);

  assert(this.init_done, 'write before init');
  assert(this.mode !== exports.NONE, 'already finalized');
  assert.equal(false, this.write_in_progress, 'write already in progress');
  assert.equal(false, this.pending_close, 'close is pending');

  this.write_in_progress = true;

  assert.equal(false, flush === undefined, 'must provide flush value');

  this.write_in_progress = true;

  if (flush !== exports.Z_NO_FLUSH && flush !== exports.Z_PARTIAL_FLUSH && flush !== exports.Z_SYNC_FLUSH && flush !== exports.Z_FULL_FLUSH && flush !== exports.Z_FINISH && flush !== exports.Z_BLOCK) {
    throw new Error('Invalid flush value');
  }

  if (input == null) {
    input = Buffer.alloc(0);
    in_len = 0;
    in_off = 0;
  }

  this.strm.avail_in = in_len;
  this.strm.input = input;
  this.strm.next_in = in_off;
  this.strm.avail_out = out_len;
  this.strm.output = out;
  this.strm.next_out = out_off;
  this.flush = flush;

  if (!async) {
    // sync version
    this._process();

    if (this._checkError()) {
      return this._afterSync();
    }
    return;
  }

  // async version
  var self = this;
  process.nextTick(function () {
    self._process();
    self._after();
  });

  return this;
};

Zlib.prototype._afterSync = function () {
  var avail_out = this.strm.avail_out;
  var avail_in = this.strm.avail_in;

  this.write_in_progress = false;

  return [avail_in, avail_out];
};

Zlib.prototype._process = function () {
  var next_expected_header_byte = null;

  // If the avail_out is left at 0, then it means that it ran out
  // of room.  If there was avail_out left over, then it means
  // that all of the input was consumed.
  switch (this.mode) {
    case exports.DEFLATE:
    case exports.GZIP:
    case exports.DEFLATERAW:
      this.err = zlib_deflate.deflate(this.strm, this.flush);
      break;
    case exports.UNZIP:
      if (this.strm.avail_in > 0) {
        next_expected_header_byte = this.strm.next_in;
      }

      switch (this.gzip_id_bytes_read) {
        case 0:
          if (next_expected_header_byte === null) {
            break;
          }

          if (this.strm.input[next_expected_header_byte] === GZIP_HEADER_ID1) {
            this.gzip_id_bytes_read = 1;
            next_expected_header_byte++;

            if (this.strm.avail_in === 1) {
              // The only available byte was already read.
              break;
            }
          } else {
            this.mode = exports.INFLATE;
            break;
          }

        // fallthrough
        case 1:
          if (next_expected_header_byte === null) {
            break;
          }

          if (this.strm.input[next_expected_header_byte] === GZIP_HEADER_ID2) {
            this.gzip_id_bytes_read = 2;
            this.mode = exports.GUNZIP;
          } else {
            // There is no actual difference between INFLATE and INFLATERAW
            // (after initialization).
            this.mode = exports.INFLATE;
          }

          break;
        default:
          throw new Error('invalid number of gzip magic number bytes read');
      }

    // fallthrough
    case exports.INFLATE:
    case exports.GUNZIP:
    case exports.INFLATERAW:
      this.err = zlib_inflate.inflate(this.strm, this.flush

      // If data was encoded with dictionary
      );if (this.err === exports.Z_NEED_DICT && this.dictionary) {
        // Load it
        this.err = zlib_inflate.inflateSetDictionary(this.strm, this.dictionary);
        if (this.err === exports.Z_OK) {
          // And try to decode again
          this.err = zlib_inflate.inflate(this.strm, this.flush);
        } else if (this.err === exports.Z_DATA_ERROR) {
          // Both inflateSetDictionary() and inflate() return Z_DATA_ERROR.
          // Make it possible for After() to tell a bad dictionary from bad
          // input.
          this.err = exports.Z_NEED_DICT;
        }
      }
      while (this.strm.avail_in > 0 && this.mode === exports.GUNZIP && this.err === exports.Z_STREAM_END && this.strm.next_in[0] !== 0x00) {
        // Bytes remain in input buffer. Perhaps this is another compressed
        // member in the same archive, or just trailing garbage.
        // Trailing zero bytes are okay, though, since they are frequently
        // used for padding.

        this.reset();
        this.err = zlib_inflate.inflate(this.strm, this.flush);
      }
      break;
    default:
      throw new Error('Unknown mode ' + this.mode);
  }
};

Zlib.prototype._checkError = function () {
  // Acceptable error states depend on the type of zlib stream.
  switch (this.err) {
    case exports.Z_OK:
    case exports.Z_BUF_ERROR:
      if (this.strm.avail_out !== 0 && this.flush === exports.Z_FINISH) {
        this._error('unexpected end of file');
        return false;
      }
      break;
    case exports.Z_STREAM_END:
      // normal statuses, not fatal
      break;
    case exports.Z_NEED_DICT:
      if (this.dictionary == null) {
        this._error('Missing dictionary');
      } else {
        this._error('Bad dictionary');
      }
      return false;
    default:
      // something else.
      this._error('Zlib error');
      return false;
  }

  return true;
};

Zlib.prototype._after = function () {
  if (!this._checkError()) {
    return;
  }

  var avail_out = this.strm.avail_out;
  var avail_in = this.strm.avail_in;

  this.write_in_progress = false;

  // call the write() cb
  this.callback(avail_in, avail_out);

  if (this.pending_close) {
    this.close();
  }
};

Zlib.prototype._error = function (message) {
  if (this.strm.msg) {
    message = this.strm.msg;
  }
  this.onerror(message, this.err

  // no hope of rescue.
  );this.write_in_progress = false;
  if (this.pending_close) {
    this.close();
  }
};

Zlib.prototype.init = function (windowBits, level, memLevel, strategy, dictionary) {
  assert(arguments.length === 4 || arguments.length === 5, 'init(windowBits, level, memLevel, strategy, [dictionary])');

  assert(windowBits >= 8 && windowBits <= 15, 'invalid windowBits');
  assert(level >= -1 && level <= 9, 'invalid compression level');

  assert(memLevel >= 1 && memLevel <= 9, 'invalid memlevel');

  assert(strategy === exports.Z_FILTERED || strategy === exports.Z_HUFFMAN_ONLY || strategy === exports.Z_RLE || strategy === exports.Z_FIXED || strategy === exports.Z_DEFAULT_STRATEGY, 'invalid strategy');

  this._init(level, windowBits, memLevel, strategy, dictionary);
  this._setDictionary();
};

Zlib.prototype.params = function () {
  throw new Error('deflateParams Not supported');
};

Zlib.prototype.reset = function () {
  this._reset();
  this._setDictionary();
};

Zlib.prototype._init = function (level, windowBits, memLevel, strategy, dictionary) {
  this.level = level;
  this.windowBits = windowBits;
  this.memLevel = memLevel;
  this.strategy = strategy;

  this.flush = exports.Z_NO_FLUSH;

  this.err = exports.Z_OK;

  if (this.mode === exports.GZIP || this.mode === exports.GUNZIP) {
    this.windowBits += 16;
  }

  if (this.mode === exports.UNZIP) {
    this.windowBits += 32;
  }

  if (this.mode === exports.DEFLATERAW || this.mode === exports.INFLATERAW) {
    this.windowBits = -1 * this.windowBits;
  }

  this.strm = new Zstream();

  switch (this.mode) {
    case exports.DEFLATE:
    case exports.GZIP:
    case exports.DEFLATERAW:
      this.err = zlib_deflate.deflateInit2(this.strm, this.level, exports.Z_DEFLATED, this.windowBits, this.memLevel, this.strategy);
      break;
    case exports.INFLATE:
    case exports.GUNZIP:
    case exports.INFLATERAW:
    case exports.UNZIP:
      this.err = zlib_inflate.inflateInit2(this.strm, this.windowBits);
      break;
    default:
      throw new Error('Unknown mode ' + this.mode);
  }

  if (this.err !== exports.Z_OK) {
    this._error('Init error');
  }

  this.dictionary = dictionary;

  this.write_in_progress = false;
  this.init_done = true;
};

Zlib.prototype._setDictionary = function () {
  if (this.dictionary == null) {
    return;
  }

  this.err = exports.Z_OK;

  switch (this.mode) {
    case exports.DEFLATE:
    case exports.DEFLATERAW:
      this.err = zlib_deflate.deflateSetDictionary(this.strm, this.dictionary);
      break;
    default:
      break;
  }

  if (this.err !== exports.Z_OK) {
    this._error('Failed to set dictionary');
  }
};

Zlib.prototype._reset = function () {
  this.err = exports.Z_OK;

  switch (this.mode) {
    case exports.DEFLATE:
    case exports.DEFLATERAW:
    case exports.GZIP:
      this.err = zlib_deflate.deflateReset(this.strm);
      break;
    case exports.INFLATE:
    case exports.INFLATERAW:
    case exports.GUNZIP:
      this.err = zlib_inflate.inflateReset(this.strm);
      break;
    default:
      break;
  }

  if (this.err !== exports.Z_OK) {
    this._error('Failed to reset stream');
  }
};

exports.Zlib = Zlib;
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__("b639").Buffer, __webpack_require__("4362")))

/***/ }),

/***/ "72c5":
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(Buffer) {

var zlib = __webpack_require__("470b");

var crc32 = __webpack_require__("21eb");

var PNG_HEAD = new Buffer([137,80,78,71,13,10,26,10]);
var PNG_IHDR = new Buffer([0,0,0,13,73,72,68,82,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0]);
var PNG_IDAT = new Buffer([0,0,0,0,73,68,65,84]);
var PNG_IEND = new Buffer([0,0,0,0,73,69,78,68,174,66,96,130]);

function png(bitmap, stream) {
    stream.push(PNG_HEAD);

    var IHDR = Buffer.concat([PNG_IHDR]);
    IHDR.writeUInt32BE(bitmap.size, 8);
    IHDR.writeUInt32BE(bitmap.size, 12);
    IHDR.writeUInt32BE(crc32(IHDR.slice(4, -4)), 21);
    stream.push(IHDR);

    var IDAT = Buffer.concat([
        PNG_IDAT,
        zlib.deflateSync(bitmap.data, { level: 9 }),
        new Buffer(4)
    ]);
    IDAT.writeUInt32BE(IDAT.length - 12, 0);
    IDAT.writeUInt32BE(crc32(IDAT.slice(4, -4)), IDAT.length - 4);
    stream.push(IDAT);

    stream.push(PNG_IEND);
    stream.push(null);
}

function bitmap(matrix, size, margin) {
    var N = matrix.length;
    var X = (N + 2 * margin) * size;
    var data = new Buffer((X + 1) * X);
    data.fill(255);
    for (var i = 0; i < X; i++) {
        data[i * (X + 1)] = 0;
    }

    for (var i = 0; i < N; i++) {
        for (var j = 0; j < N; j++) {
            if (matrix[i][j]) {
                var offset = ((margin + i) * (X + 1) + (margin + j)) * size + 1;
                data.fill(0, offset, offset + size);
                for (var c = 1; c < size; c++) {
                    data.copy(data, offset + c * (X + 1), offset, offset + size);
                }
            }
        }
    }

    return {
        data: data,
        size: X
    }
}

module.exports = {
    bitmap: bitmap,
    png: png
}

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__("b639").Buffer))

/***/ }),

/***/ "7eb1":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

// See state defs from inflate.js
var BAD = 30;       /* got a data error -- remain here until reset */
var TYPE = 12;      /* i: waiting for type bits, including last-flag bit */

/*
   Decode literal, length, and distance codes and write out the resulting
   literal and match bytes until either not enough input or output is
   available, an end-of-block is encountered, or a data error is encountered.
   When large enough input and output buffers are supplied to inflate(), for
   example, a 16K input buffer and a 64K output buffer, more than 95% of the
   inflate execution time is spent in this routine.

   Entry assumptions:

        state.mode === LEN
        strm.avail_in >= 6
        strm.avail_out >= 258
        start >= strm.avail_out
        state.bits < 8

   On return, state.mode is one of:

        LEN -- ran out of enough output space or enough available input
        TYPE -- reached end of block code, inflate() to interpret next block
        BAD -- error in block data

   Notes:

    - The maximum input bits used by a length/distance pair is 15 bits for the
      length code, 5 bits for the length extra, 15 bits for the distance code,
      and 13 bits for the distance extra.  This totals 48 bits, or six bytes.
      Therefore if strm.avail_in >= 6, then there is enough input to avoid
      checking for available input while decoding.

    - The maximum bytes that a single length/distance pair can output is 258
      bytes, which is the maximum length that can be coded.  inflate_fast()
      requires strm.avail_out >= 258 for each loop to avoid checking for
      output space.
 */
module.exports = function inflate_fast(strm, start) {
  var state;
  var _in;                    /* local strm.input */
  var last;                   /* have enough input while in < last */
  var _out;                   /* local strm.output */
  var beg;                    /* inflate()'s initial strm.output */
  var end;                    /* while out < end, enough space available */
//#ifdef INFLATE_STRICT
  var dmax;                   /* maximum distance from zlib header */
//#endif
  var wsize;                  /* window size or zero if not using window */
  var whave;                  /* valid bytes in the window */
  var wnext;                  /* window write index */
  // Use `s_window` instead `window`, avoid conflict with instrumentation tools
  var s_window;               /* allocated sliding window, if wsize != 0 */
  var hold;                   /* local strm.hold */
  var bits;                   /* local strm.bits */
  var lcode;                  /* local strm.lencode */
  var dcode;                  /* local strm.distcode */
  var lmask;                  /* mask for first level of length codes */
  var dmask;                  /* mask for first level of distance codes */
  var here;                   /* retrieved table entry */
  var op;                     /* code bits, operation, extra bits, or */
                              /*  window position, window bytes to copy */
  var len;                    /* match length, unused bytes */
  var dist;                   /* match distance */
  var from;                   /* where to copy match from */
  var from_source;


  var input, output; // JS specific, because we have no pointers

  /* copy state to local variables */
  state = strm.state;
  //here = state.here;
  _in = strm.next_in;
  input = strm.input;
  last = _in + (strm.avail_in - 5);
  _out = strm.next_out;
  output = strm.output;
  beg = _out - (start - strm.avail_out);
  end = _out + (strm.avail_out - 257);
//#ifdef INFLATE_STRICT
  dmax = state.dmax;
//#endif
  wsize = state.wsize;
  whave = state.whave;
  wnext = state.wnext;
  s_window = state.window;
  hold = state.hold;
  bits = state.bits;
  lcode = state.lencode;
  dcode = state.distcode;
  lmask = (1 << state.lenbits) - 1;
  dmask = (1 << state.distbits) - 1;


  /* decode literals and length/distances until end-of-block or not enough
     input data or output space */

  top:
  do {
    if (bits < 15) {
      hold += input[_in++] << bits;
      bits += 8;
      hold += input[_in++] << bits;
      bits += 8;
    }

    here = lcode[hold & lmask];

    dolen:
    for (;;) { // Goto emulation
      op = here >>> 24/*here.bits*/;
      hold >>>= op;
      bits -= op;
      op = (here >>> 16) & 0xff/*here.op*/;
      if (op === 0) {                          /* literal */
        //Tracevv((stderr, here.val >= 0x20 && here.val < 0x7f ?
        //        "inflate:         literal '%c'\n" :
        //        "inflate:         literal 0x%02x\n", here.val));
        output[_out++] = here & 0xffff/*here.val*/;
      }
      else if (op & 16) {                     /* length base */
        len = here & 0xffff/*here.val*/;
        op &= 15;                           /* number of extra bits */
        if (op) {
          if (bits < op) {
            hold += input[_in++] << bits;
            bits += 8;
          }
          len += hold & ((1 << op) - 1);
          hold >>>= op;
          bits -= op;
        }
        //Tracevv((stderr, "inflate:         length %u\n", len));
        if (bits < 15) {
          hold += input[_in++] << bits;
          bits += 8;
          hold += input[_in++] << bits;
          bits += 8;
        }
        here = dcode[hold & dmask];

        dodist:
        for (;;) { // goto emulation
          op = here >>> 24/*here.bits*/;
          hold >>>= op;
          bits -= op;
          op = (here >>> 16) & 0xff/*here.op*/;

          if (op & 16) {                      /* distance base */
            dist = here & 0xffff/*here.val*/;
            op &= 15;                       /* number of extra bits */
            if (bits < op) {
              hold += input[_in++] << bits;
              bits += 8;
              if (bits < op) {
                hold += input[_in++] << bits;
                bits += 8;
              }
            }
            dist += hold & ((1 << op) - 1);
//#ifdef INFLATE_STRICT
            if (dist > dmax) {
              strm.msg = 'invalid distance too far back';
              state.mode = BAD;
              break top;
            }
//#endif
            hold >>>= op;
            bits -= op;
            //Tracevv((stderr, "inflate:         distance %u\n", dist));
            op = _out - beg;                /* max distance in output */
            if (dist > op) {                /* see if copy from window */
              op = dist - op;               /* distance back in window */
              if (op > whave) {
                if (state.sane) {
                  strm.msg = 'invalid distance too far back';
                  state.mode = BAD;
                  break top;
                }

// (!) This block is disabled in zlib defaults,
// don't enable it for binary compatibility
//#ifdef INFLATE_ALLOW_INVALID_DISTANCE_TOOFAR_ARRR
//                if (len <= op - whave) {
//                  do {
//                    output[_out++] = 0;
//                  } while (--len);
//                  continue top;
//                }
//                len -= op - whave;
//                do {
//                  output[_out++] = 0;
//                } while (--op > whave);
//                if (op === 0) {
//                  from = _out - dist;
//                  do {
//                    output[_out++] = output[from++];
//                  } while (--len);
//                  continue top;
//                }
//#endif
              }
              from = 0; // window index
              from_source = s_window;
              if (wnext === 0) {           /* very common case */
                from += wsize - op;
                if (op < len) {         /* some from window */
                  len -= op;
                  do {
                    output[_out++] = s_window[from++];
                  } while (--op);
                  from = _out - dist;  /* rest from output */
                  from_source = output;
                }
              }
              else if (wnext < op) {      /* wrap around window */
                from += wsize + wnext - op;
                op -= wnext;
                if (op < len) {         /* some from end of window */
                  len -= op;
                  do {
                    output[_out++] = s_window[from++];
                  } while (--op);
                  from = 0;
                  if (wnext < len) {  /* some from start of window */
                    op = wnext;
                    len -= op;
                    do {
                      output[_out++] = s_window[from++];
                    } while (--op);
                    from = _out - dist;      /* rest from output */
                    from_source = output;
                  }
                }
              }
              else {                      /* contiguous in window */
                from += wnext - op;
                if (op < len) {         /* some from window */
                  len -= op;
                  do {
                    output[_out++] = s_window[from++];
                  } while (--op);
                  from = _out - dist;  /* rest from output */
                  from_source = output;
                }
              }
              while (len > 2) {
                output[_out++] = from_source[from++];
                output[_out++] = from_source[from++];
                output[_out++] = from_source[from++];
                len -= 3;
              }
              if (len) {
                output[_out++] = from_source[from++];
                if (len > 1) {
                  output[_out++] = from_source[from++];
                }
              }
            }
            else {
              from = _out - dist;          /* copy direct from output */
              do {                        /* minimum length is three */
                output[_out++] = output[from++];
                output[_out++] = output[from++];
                output[_out++] = output[from++];
                len -= 3;
              } while (len > 2);
              if (len) {
                output[_out++] = output[from++];
                if (len > 1) {
                  output[_out++] = output[from++];
                }
              }
            }
          }
          else if ((op & 64) === 0) {          /* 2nd level distance code */
            here = dcode[(here & 0xffff)/*here.val*/ + (hold & ((1 << op) - 1))];
            continue dodist;
          }
          else {
            strm.msg = 'invalid distance code';
            state.mode = BAD;
            break top;
          }

          break; // need to emulate goto via "continue"
        }
      }
      else if ((op & 64) === 0) {              /* 2nd level length code */
        here = lcode[(here & 0xffff)/*here.val*/ + (hold & ((1 << op) - 1))];
        continue dolen;
      }
      else if (op & 32) {                     /* end-of-block */
        //Tracevv((stderr, "inflate:         end of block\n"));
        state.mode = TYPE;
        break top;
      }
      else {
        strm.msg = 'invalid literal/length code';
        state.mode = BAD;
        break top;
      }

      break; // need to emulate goto via "continue"
    }
  } while (_in < last && _out < end);

  /* return unused bytes (on entry, bits < 8, so in won't go too far back) */
  len = bits >> 3;
  _in -= len;
  bits -= len << 3;
  hold &= (1 << bits) - 1;

  /* update state and return */
  strm.next_in = _in;
  strm.next_out = _out;
  strm.avail_in = (_in < last ? 5 + (last - _in) : 5 - (_in - last));
  strm.avail_out = (_out < end ? 257 + (end - _out) : 257 - (_out - end));
  state.hold = hold;
  state.bits = bits;
  return;
};


/***/ }),

/***/ "8936":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

function ZStream() {
  /* next input byte */
  this.input = null; // JS specific, because we have no pointers
  this.next_in = 0;
  /* number of bytes available at input */
  this.avail_in = 0;
  /* total number of input bytes read so far */
  this.total_in = 0;
  /* next output byte should be put there */
  this.output = null; // JS specific, because we have no pointers
  this.next_out = 0;
  /* remaining free space at output */
  this.avail_out = 0;
  /* total number of bytes output so far */
  this.total_out = 0;
  /* last error message, NULL if no error */
  this.msg = ''/*Z_NULL*/;
  /* not visible by applications */
  this.state = null;
  /* best guess about the data type: binary or text */
  this.data_type = 2/*Z_UNKNOWN*/;
  /* adler32 value of the uncompressed data */
  this.adler = 0;
}

module.exports = ZStream;


/***/ }),

/***/ "90b5":
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(Buffer) {

// {{{1 Initialize matrix with zeros
function init(version) {
    var N = version * 4 + 17;
    var matrix = [];
    var zeros = new Buffer(N);
    zeros.fill(0);
    zeros = [].slice.call(zeros);
    for (var i = 0; i < N; i++) {
        matrix[i] = zeros.slice();
    }
    return matrix;
}

// {{{1 Put finders into matrix
function fillFinders(matrix) {
    var N = matrix.length;
    for (var i = -3; i <= 3; i++) {
        for (var j = -3; j <= 3; j++) {
            var max = Math.max(i, j);
            var min = Math.min(i, j);
            var pixel = (max == 2 && min >= -2) || (min == -2 && max <= 2) ? 0x80 : 0x81;
            matrix[3 + i][3 + j] = pixel;
            matrix[3 + i][N - 4 + j] = pixel;
            matrix[N - 4 + i][3 + j] = pixel;
        }
    }
    for (var i = 0; i < 8; i++) {
        matrix[7][i] = matrix[i][7] =
        matrix[7][N - i - 1] = matrix[i][N - 8] =
        matrix[N - 8][i] = matrix[N - 1 - i][7] = 0x80;
    }
}

// {{{1 Put align and timinig
function fillAlignAndTiming(matrix) {
    var N = matrix.length;
    if (N > 21) {
        var len = N - 13;
        var delta = Math.round(len / Math.ceil(len / 28));
        if (delta % 2) delta++;
        var res = [];
        for (var p = len + 6; p > 10; p -= delta) {
            res.unshift(p);
        }
        res.unshift(6);
        for (var i = 0; i < res.length; i++) {
            for (var j = 0; j < res.length; j++) {
                var x = res[i], y = res[j];
                if (matrix[x][y]) continue;
                for (var r = -2; r <=2 ; r++) {
                    for (var c = -2; c <=2 ; c++) {
                        var max = Math.max(r, c);
                        var min = Math.min(r, c);
                        var pixel = (max == 1 && min >= -1) || (min == -1 && max <= 1) ? 0x80 : 0x81;
                        matrix[x + r][y + c] = pixel;
                    }
                }
            }
        }
    }
    for (var i = 8; i < N - 8; i++) {
        matrix[6][i] = matrix[i][6] = i % 2 ? 0x80 : 0x81;
    }
}

// {{{1 Fill reserved areas with zeroes
function fillStub(matrix) {
    var N = matrix.length;
    for (var i = 0; i < 8; i++) {
        if (i != 6) {
            matrix[8][i] = matrix[i][8] = 0x80;
        }
        matrix[8][N - 1 - i] = 0x80;
        matrix[N - 1 - i][8] = 0x80;
    }
    matrix[8][8] = 0x80;
    matrix[N - 8][8] = 0x81;

    if (N < 45) return;

    for (var i = N - 11; i < N - 8; i++) {
        for (var j = 0; j < 6; j++) {
            matrix[i][j] = matrix[j][i] = 0x80;
        }
    }
}

// {{{1 Fill reserved areas
var fillReserved = (function() {
    var FORMATS = Array(32);
    var VERSIONS = Array(40);

    var gf15 = 0x0537;
    var gf18 = 0x1f25;
    var formats_mask = 0x5412;

    for (var format = 0; format < 32; format++) {
        var res = format << 10;
        for (var i = 5; i > 0; i--) {
            if (res >>> (9 + i)) {
                res = res ^ (gf15 << (i - 1));
            }
        }
        FORMATS[format] = (res | (format << 10)) ^ formats_mask;
    }

    for (var version = 7; version <= 40; version++) {
        var res = version << 12;
        for (var i = 6; i > 0; i--) {
            if (res >>> (11 + i)) {
                res = res ^ (gf18 << (i - 1));
            }
        }
        VERSIONS[version] = (res | (version << 12));
    }

    var EC_LEVELS = { L: 1, M: 0, Q: 3, H: 2 };

    return function fillReserved(matrix, ec_level, mask) {
        var N = matrix.length;
        var format = FORMATS[EC_LEVELS[ec_level] << 3 | mask];
        function F(k) { return format >> k & 1 ? 0x81 : 0x80 };
        for (var i = 0; i < 8; i++) {
            matrix[8][N - 1 - i] = F(i);
            if (i < 6) matrix[i][8] = F(i);
        }
        for (var i = 8; i < 15; i++) {
            matrix[N - 15 + i][8] = F(i);
            if (i > 8) matrix[8][14 - i] = F(i);
        }
        matrix[7][8] = F(6);
        matrix[8][8] = F(7);
        matrix[8][7] = F(8);

        var version = VERSIONS[(N - 17)/4];
        if (!version) return;
        function V(k) { return version >> k & 1 ? 0x81 : 0x80 };
        for (var i = 0; i < 6; i++) {
            for (var j = 0; j < 3; j++) {
                matrix[N - 11 + j][i] = matrix[i][N - 11 + j] = V(i * 3 + j);
            }
        }
    }
})();

// {{{1 Fill data
var fillData = (function() {
    var MASK_FUNCTIONS = [
        function(i, j) { return (i + j) % 2 == 0 },
        function(i, j) { return i % 2 == 0 },
        function(i, j) { return j % 3 == 0 },
        function(i, j) { return (i + j) % 3 == 0 },
        function(i, j) { return (Math.floor(i / 2) + Math.floor(j / 3) ) % 2 == 0 },
        function(i, j) { return (i * j) % 2 + (i * j) % 3 == 0 },
        function(i, j) { return ( (i * j) % 2 + (i * j) % 3) % 2 == 0 },
        function(i, j) { return ( (i * j) % 3 + (i + j) % 2) % 2 == 0 }
    ];

    return function fillData(matrix, data, mask) {
        var N = matrix.length;
        var row, col, dir = -1;
        row = col = N - 1;
        var mask_fn = MASK_FUNCTIONS[mask];
        var len = data.blocks[data.blocks.length - 1].length;

        for (var i = 0; i < len; i++) {
            for (var b = 0; b < data.blocks.length; b++) {
                if (data.blocks[b].length <= i) continue;
                put(data.blocks[b][i]);
            }
        }

        len = data.ec_len;
        for (var i = 0; i < len; i++) {
            for (var b = 0; b < data.ec.length; b++) {
                put(data.ec[b][i]);
            }
        }

        if (col > -1) {
            do {
                matrix[row][col] = mask_fn(row, col) ? 1 : 0;
            } while (next());
        }

        function put(byte) {
            for (var mask = 0x80; mask; mask = mask >> 1) {
                var pixel = !!(mask & byte);
                if (mask_fn(row, col)) pixel = !pixel;
                matrix[row][col] = pixel ? 1 : 0;
                next();
            }
        }

        function next() {
            do {
                if ((col % 2) ^ (col < 6)) {
                    if (dir < 0 && row == 0 || dir > 0 && row == N - 1) {
                        col--;
                        dir = -dir;
                    } else {
                        col++;
                        row += dir;
                    }
                } else {
                    col--;
                }
                if (col == 6) {
                    col--;
                }
                if (col < 0) {
                    return false;
                }
            } while (matrix[row][col] & 0xf0);
            return true;
        }
    }
})();

// {{{1 Calculate penalty
function calculatePenalty(matrix) {
    var N = matrix.length;
    var penalty = 0;
    // Rule 1
    for (var i = 0; i < N; i++) {
        var pixel = matrix[i][0] & 1;
        var len = 1;
        for (var j = 1; j < N; j++) {
            var p = matrix[i][j] & 1;
            if (p == pixel) {
                len++;
                continue;
            }
            if (len >= 5) {
                penalty += len - 2;
            }
            pixel = p;
            len = 1;
        }
        if (len >= 5) {
            penalty += len - 2;
        }
    }
    for (var j = 0; j < N; j++) {
        var pixel = matrix[0][j] & 1;
        var len = 1;
        for (var i = 1; i < N; i++) {
            var p = matrix[i][j] & 1;
            if (p == pixel) {
                len++;
                continue;
            }
            if (len >= 5) {
                penalty += len - 2;
            }
            pixel = p;
            len = 1;
        }
        if (len >= 5) {
            penalty += len - 2;
        }
    }

    // Rule 2
    for (var i = 0; i < N - 1; i++) {
        for (var j = 0; j < N - 1; j++) {
            var s = matrix[i][j] + matrix[i][j + 1] + matrix[i + 1][j] + matrix[i + 1][j + 1] & 7;
            if (s == 0 || s == 4) {
                penalty += 3;
            }
        }
    }

    // Rule 3
    function I(k) { return matrix[i][j + k] & 1 };
    function J(k) { return matrix[i + k][j] & 1 };
    for (var i = 0; i < N; i++) {
        for (var j = 0; j < N; j++) {
            if (j < N - 6 && I(0) && !I(1) && I(2) && I(3) && I(4) && !I(5) && I(6)) {
                if (j >= 4 && !(I(-4) || I(-3) || I(-2) || I(-1))) {
                    penalty += 40;
                }
                if (j < N - 10 && !(I(7) || I(8) || I(9) || I(10))) {
                    penalty += 40;
                }
            }

            if (i < N - 6 && J(0) && !J(1) && J(2) && J(3) && J(4) && !J(5) && J(6)) {
                if (i >= 4 && !(J(-4) || J(-3) || J(-2) || J(-1))) {
                    penalty += 40;
                }
                if (i < N - 10 && !(J(7) || J(8) || J(9) || J(10))) {
                    penalty += 40;
                }
            }
        }
    }

    // Rule 4
    var numDark = 0;
    for (var i = 0; i < N; i++) {
        for (var j = 0; j < N; j++) {
            if (matrix[i][j] & 1) numDark++;
        }
    }
    penalty += 10 * Math.floor(Math.abs(10 - 20 * numDark/(N * N)));

    return penalty;
}

// {{{1 All-in-one function
function getMatrix(data) {
    var matrix = init(data.version);
    fillFinders(matrix);
    fillAlignAndTiming(matrix);
    fillStub(matrix);

    var penalty = Infinity;
    var bestMask = 0;
    for (var mask = 0; mask < 8; mask++) {
        fillData(matrix, data, mask);
        fillReserved(matrix, data.ec_level, mask);
        var p = calculatePenalty(matrix);
        if (p < penalty) {
            penalty = p;
            bestMask = mask;
        }
    }

    fillData(matrix, data, bestMask);
    fillReserved(matrix, data.ec_level, bestMask);

    return matrix.map(function(row) {
        return row.map(function(cell) {
            return cell & 1;
        });
    });
}

// {{{1 export functions
module.exports = {
    getMatrix: getMatrix,
    init: init,
    fillFinders: fillFinders,
    fillAlignAndTiming: fillAlignAndTiming,
    fillStub: fillStub,
    fillReserved: fillReserved,
    fillData: fillData,
    calculatePenalty: calculatePenalty,
}

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__("b639").Buffer))

/***/ }),

/***/ "9e6e":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

var utils         = __webpack_require__("be7f");
var adler32       = __webpack_require__("c834");
var crc32         = __webpack_require__("eeda");
var inflate_fast  = __webpack_require__("7eb1");
var inflate_table = __webpack_require__("6853");

var CODES = 0;
var LENS = 1;
var DISTS = 2;

/* Public constants ==========================================================*/
/* ===========================================================================*/


/* Allowed flush values; see deflate() and inflate() below for details */
//var Z_NO_FLUSH      = 0;
//var Z_PARTIAL_FLUSH = 1;
//var Z_SYNC_FLUSH    = 2;
//var Z_FULL_FLUSH    = 3;
var Z_FINISH        = 4;
var Z_BLOCK         = 5;
var Z_TREES         = 6;


/* Return codes for the compression/decompression functions. Negative values
 * are errors, positive values are used for special but normal events.
 */
var Z_OK            = 0;
var Z_STREAM_END    = 1;
var Z_NEED_DICT     = 2;
//var Z_ERRNO         = -1;
var Z_STREAM_ERROR  = -2;
var Z_DATA_ERROR    = -3;
var Z_MEM_ERROR     = -4;
var Z_BUF_ERROR     = -5;
//var Z_VERSION_ERROR = -6;

/* The deflate compression method */
var Z_DEFLATED  = 8;


/* STATES ====================================================================*/
/* ===========================================================================*/


var    HEAD = 1;       /* i: waiting for magic header */
var    FLAGS = 2;      /* i: waiting for method and flags (gzip) */
var    TIME = 3;       /* i: waiting for modification time (gzip) */
var    OS = 4;         /* i: waiting for extra flags and operating system (gzip) */
var    EXLEN = 5;      /* i: waiting for extra length (gzip) */
var    EXTRA = 6;      /* i: waiting for extra bytes (gzip) */
var    NAME = 7;       /* i: waiting for end of file name (gzip) */
var    COMMENT = 8;    /* i: waiting for end of comment (gzip) */
var    HCRC = 9;       /* i: waiting for header crc (gzip) */
var    DICTID = 10;    /* i: waiting for dictionary check value */
var    DICT = 11;      /* waiting for inflateSetDictionary() call */
var        TYPE = 12;      /* i: waiting for type bits, including last-flag bit */
var        TYPEDO = 13;    /* i: same, but skip check to exit inflate on new block */
var        STORED = 14;    /* i: waiting for stored size (length and complement) */
var        COPY_ = 15;     /* i/o: same as COPY below, but only first time in */
var        COPY = 16;      /* i/o: waiting for input or output to copy stored block */
var        TABLE = 17;     /* i: waiting for dynamic block table lengths */
var        LENLENS = 18;   /* i: waiting for code length code lengths */
var        CODELENS = 19;  /* i: waiting for length/lit and distance code lengths */
var            LEN_ = 20;      /* i: same as LEN below, but only first time in */
var            LEN = 21;       /* i: waiting for length/lit/eob code */
var            LENEXT = 22;    /* i: waiting for length extra bits */
var            DIST = 23;      /* i: waiting for distance code */
var            DISTEXT = 24;   /* i: waiting for distance extra bits */
var            MATCH = 25;     /* o: waiting for output space to copy string */
var            LIT = 26;       /* o: waiting for output space to write literal */
var    CHECK = 27;     /* i: waiting for 32-bit check value */
var    LENGTH = 28;    /* i: waiting for 32-bit length (gzip) */
var    DONE = 29;      /* finished check, done -- remain here until reset */
var    BAD = 30;       /* got a data error -- remain here until reset */
var    MEM = 31;       /* got an inflate() memory error -- remain here until reset */
var    SYNC = 32;      /* looking for synchronization bytes to restart inflate() */

/* ===========================================================================*/



var ENOUGH_LENS = 852;
var ENOUGH_DISTS = 592;
//var ENOUGH =  (ENOUGH_LENS+ENOUGH_DISTS);

var MAX_WBITS = 15;
/* 32K LZ77 window */
var DEF_WBITS = MAX_WBITS;


function zswap32(q) {
  return  (((q >>> 24) & 0xff) +
          ((q >>> 8) & 0xff00) +
          ((q & 0xff00) << 8) +
          ((q & 0xff) << 24));
}


function InflateState() {
  this.mode = 0;             /* current inflate mode */
  this.last = false;          /* true if processing last block */
  this.wrap = 0;              /* bit 0 true for zlib, bit 1 true for gzip */
  this.havedict = false;      /* true if dictionary provided */
  this.flags = 0;             /* gzip header method and flags (0 if zlib) */
  this.dmax = 0;              /* zlib header max distance (INFLATE_STRICT) */
  this.check = 0;             /* protected copy of check value */
  this.total = 0;             /* protected copy of output count */
  // TODO: may be {}
  this.head = null;           /* where to save gzip header information */

  /* sliding window */
  this.wbits = 0;             /* log base 2 of requested window size */
  this.wsize = 0;             /* window size or zero if not using window */
  this.whave = 0;             /* valid bytes in the window */
  this.wnext = 0;             /* window write index */
  this.window = null;         /* allocated sliding window, if needed */

  /* bit accumulator */
  this.hold = 0;              /* input bit accumulator */
  this.bits = 0;              /* number of bits in "in" */

  /* for string and stored block copying */
  this.length = 0;            /* literal or length of data to copy */
  this.offset = 0;            /* distance back to copy string from */

  /* for table and code decoding */
  this.extra = 0;             /* extra bits needed */

  /* fixed and dynamic code tables */
  this.lencode = null;          /* starting table for length/literal codes */
  this.distcode = null;         /* starting table for distance codes */
  this.lenbits = 0;           /* index bits for lencode */
  this.distbits = 0;          /* index bits for distcode */

  /* dynamic table building */
  this.ncode = 0;             /* number of code length code lengths */
  this.nlen = 0;              /* number of length code lengths */
  this.ndist = 0;             /* number of distance code lengths */
  this.have = 0;              /* number of code lengths in lens[] */
  this.next = null;              /* next available space in codes[] */

  this.lens = new utils.Buf16(320); /* temporary storage for code lengths */
  this.work = new utils.Buf16(288); /* work area for code table building */

  /*
   because we don't have pointers in js, we use lencode and distcode directly
   as buffers so we don't need codes
  */
  //this.codes = new utils.Buf32(ENOUGH);       /* space for code tables */
  this.lendyn = null;              /* dynamic table for length/literal codes (JS specific) */
  this.distdyn = null;             /* dynamic table for distance codes (JS specific) */
  this.sane = 0;                   /* if false, allow invalid distance too far */
  this.back = 0;                   /* bits back of last unprocessed length/lit */
  this.was = 0;                    /* initial length of match */
}

function inflateResetKeep(strm) {
  var state;

  if (!strm || !strm.state) { return Z_STREAM_ERROR; }
  state = strm.state;
  strm.total_in = strm.total_out = state.total = 0;
  strm.msg = ''; /*Z_NULL*/
  if (state.wrap) {       /* to support ill-conceived Java test suite */
    strm.adler = state.wrap & 1;
  }
  state.mode = HEAD;
  state.last = 0;
  state.havedict = 0;
  state.dmax = 32768;
  state.head = null/*Z_NULL*/;
  state.hold = 0;
  state.bits = 0;
  //state.lencode = state.distcode = state.next = state.codes;
  state.lencode = state.lendyn = new utils.Buf32(ENOUGH_LENS);
  state.distcode = state.distdyn = new utils.Buf32(ENOUGH_DISTS);

  state.sane = 1;
  state.back = -1;
  //Tracev((stderr, "inflate: reset\n"));
  return Z_OK;
}

function inflateReset(strm) {
  var state;

  if (!strm || !strm.state) { return Z_STREAM_ERROR; }
  state = strm.state;
  state.wsize = 0;
  state.whave = 0;
  state.wnext = 0;
  return inflateResetKeep(strm);

}

function inflateReset2(strm, windowBits) {
  var wrap;
  var state;

  /* get the state */
  if (!strm || !strm.state) { return Z_STREAM_ERROR; }
  state = strm.state;

  /* extract wrap request from windowBits parameter */
  if (windowBits < 0) {
    wrap = 0;
    windowBits = -windowBits;
  }
  else {
    wrap = (windowBits >> 4) + 1;
    if (windowBits < 48) {
      windowBits &= 15;
    }
  }

  /* set number of window bits, free window if different */
  if (windowBits && (windowBits < 8 || windowBits > 15)) {
    return Z_STREAM_ERROR;
  }
  if (state.window !== null && state.wbits !== windowBits) {
    state.window = null;
  }

  /* update state and reset the rest of it */
  state.wrap = wrap;
  state.wbits = windowBits;
  return inflateReset(strm);
}

function inflateInit2(strm, windowBits) {
  var ret;
  var state;

  if (!strm) { return Z_STREAM_ERROR; }
  //strm.msg = Z_NULL;                 /* in case we return an error */

  state = new InflateState();

  //if (state === Z_NULL) return Z_MEM_ERROR;
  //Tracev((stderr, "inflate: allocated\n"));
  strm.state = state;
  state.window = null/*Z_NULL*/;
  ret = inflateReset2(strm, windowBits);
  if (ret !== Z_OK) {
    strm.state = null/*Z_NULL*/;
  }
  return ret;
}

function inflateInit(strm) {
  return inflateInit2(strm, DEF_WBITS);
}


/*
 Return state with length and distance decoding tables and index sizes set to
 fixed code decoding.  Normally this returns fixed tables from inffixed.h.
 If BUILDFIXED is defined, then instead this routine builds the tables the
 first time it's called, and returns those tables the first time and
 thereafter.  This reduces the size of the code by about 2K bytes, in
 exchange for a little execution time.  However, BUILDFIXED should not be
 used for threaded applications, since the rewriting of the tables and virgin
 may not be thread-safe.
 */
var virgin = true;

var lenfix, distfix; // We have no pointers in JS, so keep tables separate

function fixedtables(state) {
  /* build fixed huffman tables if first call (may not be thread safe) */
  if (virgin) {
    var sym;

    lenfix = new utils.Buf32(512);
    distfix = new utils.Buf32(32);

    /* literal/length table */
    sym = 0;
    while (sym < 144) { state.lens[sym++] = 8; }
    while (sym < 256) { state.lens[sym++] = 9; }
    while (sym < 280) { state.lens[sym++] = 7; }
    while (sym < 288) { state.lens[sym++] = 8; }

    inflate_table(LENS,  state.lens, 0, 288, lenfix,   0, state.work, { bits: 9 });

    /* distance table */
    sym = 0;
    while (sym < 32) { state.lens[sym++] = 5; }

    inflate_table(DISTS, state.lens, 0, 32,   distfix, 0, state.work, { bits: 5 });

    /* do this just once */
    virgin = false;
  }

  state.lencode = lenfix;
  state.lenbits = 9;
  state.distcode = distfix;
  state.distbits = 5;
}


/*
 Update the window with the last wsize (normally 32K) bytes written before
 returning.  If window does not exist yet, create it.  This is only called
 when a window is already in use, or when output has been written during this
 inflate call, but the end of the deflate stream has not been reached yet.
 It is also called to create a window for dictionary data when a dictionary
 is loaded.

 Providing output buffers larger than 32K to inflate() should provide a speed
 advantage, since only the last 32K of output is copied to the sliding window
 upon return from inflate(), and since all distances after the first 32K of
 output will fall in the output data, making match copies simpler and faster.
 The advantage may be dependent on the size of the processor's data caches.
 */
function updatewindow(strm, src, end, copy) {
  var dist;
  var state = strm.state;

  /* if it hasn't been done already, allocate space for the window */
  if (state.window === null) {
    state.wsize = 1 << state.wbits;
    state.wnext = 0;
    state.whave = 0;

    state.window = new utils.Buf8(state.wsize);
  }

  /* copy state->wsize or less output bytes into the circular window */
  if (copy >= state.wsize) {
    utils.arraySet(state.window, src, end - state.wsize, state.wsize, 0);
    state.wnext = 0;
    state.whave = state.wsize;
  }
  else {
    dist = state.wsize - state.wnext;
    if (dist > copy) {
      dist = copy;
    }
    //zmemcpy(state->window + state->wnext, end - copy, dist);
    utils.arraySet(state.window, src, end - copy, dist, state.wnext);
    copy -= dist;
    if (copy) {
      //zmemcpy(state->window, end - copy, copy);
      utils.arraySet(state.window, src, end - copy, copy, 0);
      state.wnext = copy;
      state.whave = state.wsize;
    }
    else {
      state.wnext += dist;
      if (state.wnext === state.wsize) { state.wnext = 0; }
      if (state.whave < state.wsize) { state.whave += dist; }
    }
  }
  return 0;
}

function inflate(strm, flush) {
  var state;
  var input, output;          // input/output buffers
  var next;                   /* next input INDEX */
  var put;                    /* next output INDEX */
  var have, left;             /* available input and output */
  var hold;                   /* bit buffer */
  var bits;                   /* bits in bit buffer */
  var _in, _out;              /* save starting available input and output */
  var copy;                   /* number of stored or match bytes to copy */
  var from;                   /* where to copy match bytes from */
  var from_source;
  var here = 0;               /* current decoding table entry */
  var here_bits, here_op, here_val; // paked "here" denormalized (JS specific)
  //var last;                   /* parent table entry */
  var last_bits, last_op, last_val; // paked "last" denormalized (JS specific)
  var len;                    /* length to copy for repeats, bits to drop */
  var ret;                    /* return code */
  var hbuf = new utils.Buf8(4);    /* buffer for gzip header crc calculation */
  var opts;

  var n; // temporary var for NEED_BITS

  var order = /* permutation of code lengths */
    [ 16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15 ];


  if (!strm || !strm.state || !strm.output ||
      (!strm.input && strm.avail_in !== 0)) {
    return Z_STREAM_ERROR;
  }

  state = strm.state;
  if (state.mode === TYPE) { state.mode = TYPEDO; }    /* skip check */


  //--- LOAD() ---
  put = strm.next_out;
  output = strm.output;
  left = strm.avail_out;
  next = strm.next_in;
  input = strm.input;
  have = strm.avail_in;
  hold = state.hold;
  bits = state.bits;
  //---

  _in = have;
  _out = left;
  ret = Z_OK;

  inf_leave: // goto emulation
  for (;;) {
    switch (state.mode) {
      case HEAD:
        if (state.wrap === 0) {
          state.mode = TYPEDO;
          break;
        }
        //=== NEEDBITS(16);
        while (bits < 16) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        if ((state.wrap & 2) && hold === 0x8b1f) {  /* gzip header */
          state.check = 0/*crc32(0L, Z_NULL, 0)*/;
          //=== CRC2(state.check, hold);
          hbuf[0] = hold & 0xff;
          hbuf[1] = (hold >>> 8) & 0xff;
          state.check = crc32(state.check, hbuf, 2, 0);
          //===//

          //=== INITBITS();
          hold = 0;
          bits = 0;
          //===//
          state.mode = FLAGS;
          break;
        }
        state.flags = 0;           /* expect zlib header */
        if (state.head) {
          state.head.done = false;
        }
        if (!(state.wrap & 1) ||   /* check if zlib header allowed */
          (((hold & 0xff)/*BITS(8)*/ << 8) + (hold >> 8)) % 31) {
          strm.msg = 'incorrect header check';
          state.mode = BAD;
          break;
        }
        if ((hold & 0x0f)/*BITS(4)*/ !== Z_DEFLATED) {
          strm.msg = 'unknown compression method';
          state.mode = BAD;
          break;
        }
        //--- DROPBITS(4) ---//
        hold >>>= 4;
        bits -= 4;
        //---//
        len = (hold & 0x0f)/*BITS(4)*/ + 8;
        if (state.wbits === 0) {
          state.wbits = len;
        }
        else if (len > state.wbits) {
          strm.msg = 'invalid window size';
          state.mode = BAD;
          break;
        }
        state.dmax = 1 << len;
        //Tracev((stderr, "inflate:   zlib header ok\n"));
        strm.adler = state.check = 1/*adler32(0L, Z_NULL, 0)*/;
        state.mode = hold & 0x200 ? DICTID : TYPE;
        //=== INITBITS();
        hold = 0;
        bits = 0;
        //===//
        break;
      case FLAGS:
        //=== NEEDBITS(16); */
        while (bits < 16) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        state.flags = hold;
        if ((state.flags & 0xff) !== Z_DEFLATED) {
          strm.msg = 'unknown compression method';
          state.mode = BAD;
          break;
        }
        if (state.flags & 0xe000) {
          strm.msg = 'unknown header flags set';
          state.mode = BAD;
          break;
        }
        if (state.head) {
          state.head.text = ((hold >> 8) & 1);
        }
        if (state.flags & 0x0200) {
          //=== CRC2(state.check, hold);
          hbuf[0] = hold & 0xff;
          hbuf[1] = (hold >>> 8) & 0xff;
          state.check = crc32(state.check, hbuf, 2, 0);
          //===//
        }
        //=== INITBITS();
        hold = 0;
        bits = 0;
        //===//
        state.mode = TIME;
        /* falls through */
      case TIME:
        //=== NEEDBITS(32); */
        while (bits < 32) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        if (state.head) {
          state.head.time = hold;
        }
        if (state.flags & 0x0200) {
          //=== CRC4(state.check, hold)
          hbuf[0] = hold & 0xff;
          hbuf[1] = (hold >>> 8) & 0xff;
          hbuf[2] = (hold >>> 16) & 0xff;
          hbuf[3] = (hold >>> 24) & 0xff;
          state.check = crc32(state.check, hbuf, 4, 0);
          //===
        }
        //=== INITBITS();
        hold = 0;
        bits = 0;
        //===//
        state.mode = OS;
        /* falls through */
      case OS:
        //=== NEEDBITS(16); */
        while (bits < 16) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        if (state.head) {
          state.head.xflags = (hold & 0xff);
          state.head.os = (hold >> 8);
        }
        if (state.flags & 0x0200) {
          //=== CRC2(state.check, hold);
          hbuf[0] = hold & 0xff;
          hbuf[1] = (hold >>> 8) & 0xff;
          state.check = crc32(state.check, hbuf, 2, 0);
          //===//
        }
        //=== INITBITS();
        hold = 0;
        bits = 0;
        //===//
        state.mode = EXLEN;
        /* falls through */
      case EXLEN:
        if (state.flags & 0x0400) {
          //=== NEEDBITS(16); */
          while (bits < 16) {
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          //===//
          state.length = hold;
          if (state.head) {
            state.head.extra_len = hold;
          }
          if (state.flags & 0x0200) {
            //=== CRC2(state.check, hold);
            hbuf[0] = hold & 0xff;
            hbuf[1] = (hold >>> 8) & 0xff;
            state.check = crc32(state.check, hbuf, 2, 0);
            //===//
          }
          //=== INITBITS();
          hold = 0;
          bits = 0;
          //===//
        }
        else if (state.head) {
          state.head.extra = null/*Z_NULL*/;
        }
        state.mode = EXTRA;
        /* falls through */
      case EXTRA:
        if (state.flags & 0x0400) {
          copy = state.length;
          if (copy > have) { copy = have; }
          if (copy) {
            if (state.head) {
              len = state.head.extra_len - state.length;
              if (!state.head.extra) {
                // Use untyped array for more convenient processing later
                state.head.extra = new Array(state.head.extra_len);
              }
              utils.arraySet(
                state.head.extra,
                input,
                next,
                // extra field is limited to 65536 bytes
                // - no need for additional size check
                copy,
                /*len + copy > state.head.extra_max - len ? state.head.extra_max : copy,*/
                len
              );
              //zmemcpy(state.head.extra + len, next,
              //        len + copy > state.head.extra_max ?
              //        state.head.extra_max - len : copy);
            }
            if (state.flags & 0x0200) {
              state.check = crc32(state.check, input, copy, next);
            }
            have -= copy;
            next += copy;
            state.length -= copy;
          }
          if (state.length) { break inf_leave; }
        }
        state.length = 0;
        state.mode = NAME;
        /* falls through */
      case NAME:
        if (state.flags & 0x0800) {
          if (have === 0) { break inf_leave; }
          copy = 0;
          do {
            // TODO: 2 or 1 bytes?
            len = input[next + copy++];
            /* use constant limit because in js we should not preallocate memory */
            if (state.head && len &&
                (state.length < 65536 /*state.head.name_max*/)) {
              state.head.name += String.fromCharCode(len);
            }
          } while (len && copy < have);

          if (state.flags & 0x0200) {
            state.check = crc32(state.check, input, copy, next);
          }
          have -= copy;
          next += copy;
          if (len) { break inf_leave; }
        }
        else if (state.head) {
          state.head.name = null;
        }
        state.length = 0;
        state.mode = COMMENT;
        /* falls through */
      case COMMENT:
        if (state.flags & 0x1000) {
          if (have === 0) { break inf_leave; }
          copy = 0;
          do {
            len = input[next + copy++];
            /* use constant limit because in js we should not preallocate memory */
            if (state.head && len &&
                (state.length < 65536 /*state.head.comm_max*/)) {
              state.head.comment += String.fromCharCode(len);
            }
          } while (len && copy < have);
          if (state.flags & 0x0200) {
            state.check = crc32(state.check, input, copy, next);
          }
          have -= copy;
          next += copy;
          if (len) { break inf_leave; }
        }
        else if (state.head) {
          state.head.comment = null;
        }
        state.mode = HCRC;
        /* falls through */
      case HCRC:
        if (state.flags & 0x0200) {
          //=== NEEDBITS(16); */
          while (bits < 16) {
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          //===//
          if (hold !== (state.check & 0xffff)) {
            strm.msg = 'header crc mismatch';
            state.mode = BAD;
            break;
          }
          //=== INITBITS();
          hold = 0;
          bits = 0;
          //===//
        }
        if (state.head) {
          state.head.hcrc = ((state.flags >> 9) & 1);
          state.head.done = true;
        }
        strm.adler = state.check = 0;
        state.mode = TYPE;
        break;
      case DICTID:
        //=== NEEDBITS(32); */
        while (bits < 32) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        strm.adler = state.check = zswap32(hold);
        //=== INITBITS();
        hold = 0;
        bits = 0;
        //===//
        state.mode = DICT;
        /* falls through */
      case DICT:
        if (state.havedict === 0) {
          //--- RESTORE() ---
          strm.next_out = put;
          strm.avail_out = left;
          strm.next_in = next;
          strm.avail_in = have;
          state.hold = hold;
          state.bits = bits;
          //---
          return Z_NEED_DICT;
        }
        strm.adler = state.check = 1/*adler32(0L, Z_NULL, 0)*/;
        state.mode = TYPE;
        /* falls through */
      case TYPE:
        if (flush === Z_BLOCK || flush === Z_TREES) { break inf_leave; }
        /* falls through */
      case TYPEDO:
        if (state.last) {
          //--- BYTEBITS() ---//
          hold >>>= bits & 7;
          bits -= bits & 7;
          //---//
          state.mode = CHECK;
          break;
        }
        //=== NEEDBITS(3); */
        while (bits < 3) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        state.last = (hold & 0x01)/*BITS(1)*/;
        //--- DROPBITS(1) ---//
        hold >>>= 1;
        bits -= 1;
        //---//

        switch ((hold & 0x03)/*BITS(2)*/) {
          case 0:                             /* stored block */
            //Tracev((stderr, "inflate:     stored block%s\n",
            //        state.last ? " (last)" : ""));
            state.mode = STORED;
            break;
          case 1:                             /* fixed block */
            fixedtables(state);
            //Tracev((stderr, "inflate:     fixed codes block%s\n",
            //        state.last ? " (last)" : ""));
            state.mode = LEN_;             /* decode codes */
            if (flush === Z_TREES) {
              //--- DROPBITS(2) ---//
              hold >>>= 2;
              bits -= 2;
              //---//
              break inf_leave;
            }
            break;
          case 2:                             /* dynamic block */
            //Tracev((stderr, "inflate:     dynamic codes block%s\n",
            //        state.last ? " (last)" : ""));
            state.mode = TABLE;
            break;
          case 3:
            strm.msg = 'invalid block type';
            state.mode = BAD;
        }
        //--- DROPBITS(2) ---//
        hold >>>= 2;
        bits -= 2;
        //---//
        break;
      case STORED:
        //--- BYTEBITS() ---// /* go to byte boundary */
        hold >>>= bits & 7;
        bits -= bits & 7;
        //---//
        //=== NEEDBITS(32); */
        while (bits < 32) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        if ((hold & 0xffff) !== ((hold >>> 16) ^ 0xffff)) {
          strm.msg = 'invalid stored block lengths';
          state.mode = BAD;
          break;
        }
        state.length = hold & 0xffff;
        //Tracev((stderr, "inflate:       stored length %u\n",
        //        state.length));
        //=== INITBITS();
        hold = 0;
        bits = 0;
        //===//
        state.mode = COPY_;
        if (flush === Z_TREES) { break inf_leave; }
        /* falls through */
      case COPY_:
        state.mode = COPY;
        /* falls through */
      case COPY:
        copy = state.length;
        if (copy) {
          if (copy > have) { copy = have; }
          if (copy > left) { copy = left; }
          if (copy === 0) { break inf_leave; }
          //--- zmemcpy(put, next, copy); ---
          utils.arraySet(output, input, next, copy, put);
          //---//
          have -= copy;
          next += copy;
          left -= copy;
          put += copy;
          state.length -= copy;
          break;
        }
        //Tracev((stderr, "inflate:       stored end\n"));
        state.mode = TYPE;
        break;
      case TABLE:
        //=== NEEDBITS(14); */
        while (bits < 14) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        state.nlen = (hold & 0x1f)/*BITS(5)*/ + 257;
        //--- DROPBITS(5) ---//
        hold >>>= 5;
        bits -= 5;
        //---//
        state.ndist = (hold & 0x1f)/*BITS(5)*/ + 1;
        //--- DROPBITS(5) ---//
        hold >>>= 5;
        bits -= 5;
        //---//
        state.ncode = (hold & 0x0f)/*BITS(4)*/ + 4;
        //--- DROPBITS(4) ---//
        hold >>>= 4;
        bits -= 4;
        //---//
//#ifndef PKZIP_BUG_WORKAROUND
        if (state.nlen > 286 || state.ndist > 30) {
          strm.msg = 'too many length or distance symbols';
          state.mode = BAD;
          break;
        }
//#endif
        //Tracev((stderr, "inflate:       table sizes ok\n"));
        state.have = 0;
        state.mode = LENLENS;
        /* falls through */
      case LENLENS:
        while (state.have < state.ncode) {
          //=== NEEDBITS(3);
          while (bits < 3) {
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          //===//
          state.lens[order[state.have++]] = (hold & 0x07);//BITS(3);
          //--- DROPBITS(3) ---//
          hold >>>= 3;
          bits -= 3;
          //---//
        }
        while (state.have < 19) {
          state.lens[order[state.have++]] = 0;
        }
        // We have separate tables & no pointers. 2 commented lines below not needed.
        //state.next = state.codes;
        //state.lencode = state.next;
        // Switch to use dynamic table
        state.lencode = state.lendyn;
        state.lenbits = 7;

        opts = { bits: state.lenbits };
        ret = inflate_table(CODES, state.lens, 0, 19, state.lencode, 0, state.work, opts);
        state.lenbits = opts.bits;

        if (ret) {
          strm.msg = 'invalid code lengths set';
          state.mode = BAD;
          break;
        }
        //Tracev((stderr, "inflate:       code lengths ok\n"));
        state.have = 0;
        state.mode = CODELENS;
        /* falls through */
      case CODELENS:
        while (state.have < state.nlen + state.ndist) {
          for (;;) {
            here = state.lencode[hold & ((1 << state.lenbits) - 1)];/*BITS(state.lenbits)*/
            here_bits = here >>> 24;
            here_op = (here >>> 16) & 0xff;
            here_val = here & 0xffff;

            if ((here_bits) <= bits) { break; }
            //--- PULLBYTE() ---//
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
            //---//
          }
          if (here_val < 16) {
            //--- DROPBITS(here.bits) ---//
            hold >>>= here_bits;
            bits -= here_bits;
            //---//
            state.lens[state.have++] = here_val;
          }
          else {
            if (here_val === 16) {
              //=== NEEDBITS(here.bits + 2);
              n = here_bits + 2;
              while (bits < n) {
                if (have === 0) { break inf_leave; }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              //===//
              //--- DROPBITS(here.bits) ---//
              hold >>>= here_bits;
              bits -= here_bits;
              //---//
              if (state.have === 0) {
                strm.msg = 'invalid bit length repeat';
                state.mode = BAD;
                break;
              }
              len = state.lens[state.have - 1];
              copy = 3 + (hold & 0x03);//BITS(2);
              //--- DROPBITS(2) ---//
              hold >>>= 2;
              bits -= 2;
              //---//
            }
            else if (here_val === 17) {
              //=== NEEDBITS(here.bits + 3);
              n = here_bits + 3;
              while (bits < n) {
                if (have === 0) { break inf_leave; }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              //===//
              //--- DROPBITS(here.bits) ---//
              hold >>>= here_bits;
              bits -= here_bits;
              //---//
              len = 0;
              copy = 3 + (hold & 0x07);//BITS(3);
              //--- DROPBITS(3) ---//
              hold >>>= 3;
              bits -= 3;
              //---//
            }
            else {
              //=== NEEDBITS(here.bits + 7);
              n = here_bits + 7;
              while (bits < n) {
                if (have === 0) { break inf_leave; }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              //===//
              //--- DROPBITS(here.bits) ---//
              hold >>>= here_bits;
              bits -= here_bits;
              //---//
              len = 0;
              copy = 11 + (hold & 0x7f);//BITS(7);
              //--- DROPBITS(7) ---//
              hold >>>= 7;
              bits -= 7;
              //---//
            }
            if (state.have + copy > state.nlen + state.ndist) {
              strm.msg = 'invalid bit length repeat';
              state.mode = BAD;
              break;
            }
            while (copy--) {
              state.lens[state.have++] = len;
            }
          }
        }

        /* handle error breaks in while */
        if (state.mode === BAD) { break; }

        /* check for end-of-block code (better have one) */
        if (state.lens[256] === 0) {
          strm.msg = 'invalid code -- missing end-of-block';
          state.mode = BAD;
          break;
        }

        /* build code tables -- note: do not change the lenbits or distbits
           values here (9 and 6) without reading the comments in inftrees.h
           concerning the ENOUGH constants, which depend on those values */
        state.lenbits = 9;

        opts = { bits: state.lenbits };
        ret = inflate_table(LENS, state.lens, 0, state.nlen, state.lencode, 0, state.work, opts);
        // We have separate tables & no pointers. 2 commented lines below not needed.
        // state.next_index = opts.table_index;
        state.lenbits = opts.bits;
        // state.lencode = state.next;

        if (ret) {
          strm.msg = 'invalid literal/lengths set';
          state.mode = BAD;
          break;
        }

        state.distbits = 6;
        //state.distcode.copy(state.codes);
        // Switch to use dynamic table
        state.distcode = state.distdyn;
        opts = { bits: state.distbits };
        ret = inflate_table(DISTS, state.lens, state.nlen, state.ndist, state.distcode, 0, state.work, opts);
        // We have separate tables & no pointers. 2 commented lines below not needed.
        // state.next_index = opts.table_index;
        state.distbits = opts.bits;
        // state.distcode = state.next;

        if (ret) {
          strm.msg = 'invalid distances set';
          state.mode = BAD;
          break;
        }
        //Tracev((stderr, 'inflate:       codes ok\n'));
        state.mode = LEN_;
        if (flush === Z_TREES) { break inf_leave; }
        /* falls through */
      case LEN_:
        state.mode = LEN;
        /* falls through */
      case LEN:
        if (have >= 6 && left >= 258) {
          //--- RESTORE() ---
          strm.next_out = put;
          strm.avail_out = left;
          strm.next_in = next;
          strm.avail_in = have;
          state.hold = hold;
          state.bits = bits;
          //---
          inflate_fast(strm, _out);
          //--- LOAD() ---
          put = strm.next_out;
          output = strm.output;
          left = strm.avail_out;
          next = strm.next_in;
          input = strm.input;
          have = strm.avail_in;
          hold = state.hold;
          bits = state.bits;
          //---

          if (state.mode === TYPE) {
            state.back = -1;
          }
          break;
        }
        state.back = 0;
        for (;;) {
          here = state.lencode[hold & ((1 << state.lenbits) - 1)];  /*BITS(state.lenbits)*/
          here_bits = here >>> 24;
          here_op = (here >>> 16) & 0xff;
          here_val = here & 0xffff;

          if (here_bits <= bits) { break; }
          //--- PULLBYTE() ---//
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
          //---//
        }
        if (here_op && (here_op & 0xf0) === 0) {
          last_bits = here_bits;
          last_op = here_op;
          last_val = here_val;
          for (;;) {
            here = state.lencode[last_val +
                    ((hold & ((1 << (last_bits + last_op)) - 1))/*BITS(last.bits + last.op)*/ >> last_bits)];
            here_bits = here >>> 24;
            here_op = (here >>> 16) & 0xff;
            here_val = here & 0xffff;

            if ((last_bits + here_bits) <= bits) { break; }
            //--- PULLBYTE() ---//
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
            //---//
          }
          //--- DROPBITS(last.bits) ---//
          hold >>>= last_bits;
          bits -= last_bits;
          //---//
          state.back += last_bits;
        }
        //--- DROPBITS(here.bits) ---//
        hold >>>= here_bits;
        bits -= here_bits;
        //---//
        state.back += here_bits;
        state.length = here_val;
        if (here_op === 0) {
          //Tracevv((stderr, here.val >= 0x20 && here.val < 0x7f ?
          //        "inflate:         literal '%c'\n" :
          //        "inflate:         literal 0x%02x\n", here.val));
          state.mode = LIT;
          break;
        }
        if (here_op & 32) {
          //Tracevv((stderr, "inflate:         end of block\n"));
          state.back = -1;
          state.mode = TYPE;
          break;
        }
        if (here_op & 64) {
          strm.msg = 'invalid literal/length code';
          state.mode = BAD;
          break;
        }
        state.extra = here_op & 15;
        state.mode = LENEXT;
        /* falls through */
      case LENEXT:
        if (state.extra) {
          //=== NEEDBITS(state.extra);
          n = state.extra;
          while (bits < n) {
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          //===//
          state.length += hold & ((1 << state.extra) - 1)/*BITS(state.extra)*/;
          //--- DROPBITS(state.extra) ---//
          hold >>>= state.extra;
          bits -= state.extra;
          //---//
          state.back += state.extra;
        }
        //Tracevv((stderr, "inflate:         length %u\n", state.length));
        state.was = state.length;
        state.mode = DIST;
        /* falls through */
      case DIST:
        for (;;) {
          here = state.distcode[hold & ((1 << state.distbits) - 1)];/*BITS(state.distbits)*/
          here_bits = here >>> 24;
          here_op = (here >>> 16) & 0xff;
          here_val = here & 0xffff;

          if ((here_bits) <= bits) { break; }
          //--- PULLBYTE() ---//
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
          //---//
        }
        if ((here_op & 0xf0) === 0) {
          last_bits = here_bits;
          last_op = here_op;
          last_val = here_val;
          for (;;) {
            here = state.distcode[last_val +
                    ((hold & ((1 << (last_bits + last_op)) - 1))/*BITS(last.bits + last.op)*/ >> last_bits)];
            here_bits = here >>> 24;
            here_op = (here >>> 16) & 0xff;
            here_val = here & 0xffff;

            if ((last_bits + here_bits) <= bits) { break; }
            //--- PULLBYTE() ---//
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
            //---//
          }
          //--- DROPBITS(last.bits) ---//
          hold >>>= last_bits;
          bits -= last_bits;
          //---//
          state.back += last_bits;
        }
        //--- DROPBITS(here.bits) ---//
        hold >>>= here_bits;
        bits -= here_bits;
        //---//
        state.back += here_bits;
        if (here_op & 64) {
          strm.msg = 'invalid distance code';
          state.mode = BAD;
          break;
        }
        state.offset = here_val;
        state.extra = (here_op) & 15;
        state.mode = DISTEXT;
        /* falls through */
      case DISTEXT:
        if (state.extra) {
          //=== NEEDBITS(state.extra);
          n = state.extra;
          while (bits < n) {
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          //===//
          state.offset += hold & ((1 << state.extra) - 1)/*BITS(state.extra)*/;
          //--- DROPBITS(state.extra) ---//
          hold >>>= state.extra;
          bits -= state.extra;
          //---//
          state.back += state.extra;
        }
//#ifdef INFLATE_STRICT
        if (state.offset > state.dmax) {
          strm.msg = 'invalid distance too far back';
          state.mode = BAD;
          break;
        }
//#endif
        //Tracevv((stderr, "inflate:         distance %u\n", state.offset));
        state.mode = MATCH;
        /* falls through */
      case MATCH:
        if (left === 0) { break inf_leave; }
        copy = _out - left;
        if (state.offset > copy) {         /* copy from window */
          copy = state.offset - copy;
          if (copy > state.whave) {
            if (state.sane) {
              strm.msg = 'invalid distance too far back';
              state.mode = BAD;
              break;
            }
// (!) This block is disabled in zlib defaults,
// don't enable it for binary compatibility
//#ifdef INFLATE_ALLOW_INVALID_DISTANCE_TOOFAR_ARRR
//          Trace((stderr, "inflate.c too far\n"));
//          copy -= state.whave;
//          if (copy > state.length) { copy = state.length; }
//          if (copy > left) { copy = left; }
//          left -= copy;
//          state.length -= copy;
//          do {
//            output[put++] = 0;
//          } while (--copy);
//          if (state.length === 0) { state.mode = LEN; }
//          break;
//#endif
          }
          if (copy > state.wnext) {
            copy -= state.wnext;
            from = state.wsize - copy;
          }
          else {
            from = state.wnext - copy;
          }
          if (copy > state.length) { copy = state.length; }
          from_source = state.window;
        }
        else {                              /* copy from output */
          from_source = output;
          from = put - state.offset;
          copy = state.length;
        }
        if (copy > left) { copy = left; }
        left -= copy;
        state.length -= copy;
        do {
          output[put++] = from_source[from++];
        } while (--copy);
        if (state.length === 0) { state.mode = LEN; }
        break;
      case LIT:
        if (left === 0) { break inf_leave; }
        output[put++] = state.length;
        left--;
        state.mode = LEN;
        break;
      case CHECK:
        if (state.wrap) {
          //=== NEEDBITS(32);
          while (bits < 32) {
            if (have === 0) { break inf_leave; }
            have--;
            // Use '|' instead of '+' to make sure that result is signed
            hold |= input[next++] << bits;
            bits += 8;
          }
          //===//
          _out -= left;
          strm.total_out += _out;
          state.total += _out;
          if (_out) {
            strm.adler = state.check =
                /*UPDATE(state.check, put - _out, _out);*/
                (state.flags ? crc32(state.check, output, _out, put - _out) : adler32(state.check, output, _out, put - _out));

          }
          _out = left;
          // NB: crc32 stored as signed 32-bit int, zswap32 returns signed too
          if ((state.flags ? hold : zswap32(hold)) !== state.check) {
            strm.msg = 'incorrect data check';
            state.mode = BAD;
            break;
          }
          //=== INITBITS();
          hold = 0;
          bits = 0;
          //===//
          //Tracev((stderr, "inflate:   check matches trailer\n"));
        }
        state.mode = LENGTH;
        /* falls through */
      case LENGTH:
        if (state.wrap && state.flags) {
          //=== NEEDBITS(32);
          while (bits < 32) {
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          //===//
          if (hold !== (state.total & 0xffffffff)) {
            strm.msg = 'incorrect length check';
            state.mode = BAD;
            break;
          }
          //=== INITBITS();
          hold = 0;
          bits = 0;
          //===//
          //Tracev((stderr, "inflate:   length matches trailer\n"));
        }
        state.mode = DONE;
        /* falls through */
      case DONE:
        ret = Z_STREAM_END;
        break inf_leave;
      case BAD:
        ret = Z_DATA_ERROR;
        break inf_leave;
      case MEM:
        return Z_MEM_ERROR;
      case SYNC:
        /* falls through */
      default:
        return Z_STREAM_ERROR;
    }
  }

  // inf_leave <- here is real place for "goto inf_leave", emulated via "break inf_leave"

  /*
     Return from inflate(), updating the total counts and the check value.
     If there was no progress during the inflate() call, return a buffer
     error.  Call updatewindow() to create and/or update the window state.
     Note: a memory error from inflate() is non-recoverable.
   */

  //--- RESTORE() ---
  strm.next_out = put;
  strm.avail_out = left;
  strm.next_in = next;
  strm.avail_in = have;
  state.hold = hold;
  state.bits = bits;
  //---

  if (state.wsize || (_out !== strm.avail_out && state.mode < BAD &&
                      (state.mode < CHECK || flush !== Z_FINISH))) {
    if (updatewindow(strm, strm.output, strm.next_out, _out - strm.avail_out)) {
      state.mode = MEM;
      return Z_MEM_ERROR;
    }
  }
  _in -= strm.avail_in;
  _out -= strm.avail_out;
  strm.total_in += _in;
  strm.total_out += _out;
  state.total += _out;
  if (state.wrap && _out) {
    strm.adler = state.check = /*UPDATE(state.check, strm.next_out - _out, _out);*/
      (state.flags ? crc32(state.check, output, _out, strm.next_out - _out) : adler32(state.check, output, _out, strm.next_out - _out));
  }
  strm.data_type = state.bits + (state.last ? 64 : 0) +
                    (state.mode === TYPE ? 128 : 0) +
                    (state.mode === LEN_ || state.mode === COPY_ ? 256 : 0);
  if (((_in === 0 && _out === 0) || flush === Z_FINISH) && ret === Z_OK) {
    ret = Z_BUF_ERROR;
  }
  return ret;
}

function inflateEnd(strm) {

  if (!strm || !strm.state /*|| strm->zfree == (free_func)0*/) {
    return Z_STREAM_ERROR;
  }

  var state = strm.state;
  if (state.window) {
    state.window = null;
  }
  strm.state = null;
  return Z_OK;
}

function inflateGetHeader(strm, head) {
  var state;

  /* check state */
  if (!strm || !strm.state) { return Z_STREAM_ERROR; }
  state = strm.state;
  if ((state.wrap & 2) === 0) { return Z_STREAM_ERROR; }

  /* save header structure */
  state.head = head;
  head.done = false;
  return Z_OK;
}

function inflateSetDictionary(strm, dictionary) {
  var dictLength = dictionary.length;

  var state;
  var dictid;
  var ret;

  /* check state */
  if (!strm /* == Z_NULL */ || !strm.state /* == Z_NULL */) { return Z_STREAM_ERROR; }
  state = strm.state;

  if (state.wrap !== 0 && state.mode !== DICT) {
    return Z_STREAM_ERROR;
  }

  /* check for correct dictionary identifier */
  if (state.mode === DICT) {
    dictid = 1; /* adler32(0, null, 0)*/
    /* dictid = adler32(dictid, dictionary, dictLength); */
    dictid = adler32(dictid, dictionary, dictLength, 0);
    if (dictid !== state.check) {
      return Z_DATA_ERROR;
    }
  }
  /* copy dictionary to window using updatewindow(), which will amend the
   existing dictionary if appropriate */
  ret = updatewindow(strm, dictionary, dictLength, dictLength);
  if (ret) {
    state.mode = MEM;
    return Z_MEM_ERROR;
  }
  state.havedict = 1;
  // Tracev((stderr, "inflate:   dictionary set\n"));
  return Z_OK;
}

exports.inflateReset = inflateReset;
exports.inflateReset2 = inflateReset2;
exports.inflateResetKeep = inflateResetKeep;
exports.inflateInit = inflateInit;
exports.inflateInit2 = inflateInit2;
exports.inflate = inflate;
exports.inflateEnd = inflateEnd;
exports.inflateGetHeader = inflateGetHeader;
exports.inflateSetDictionary = inflateSetDictionary;
exports.inflateInfo = 'pako inflate (from Nodeca project)';

/* Not implemented
exports.inflateCopy = inflateCopy;
exports.inflateGetDictionary = inflateGetDictionary;
exports.inflateMark = inflateMark;
exports.inflatePrime = inflatePrime;
exports.inflateSync = inflateSync;
exports.inflateSyncPoint = inflateSyncPoint;
exports.inflateUndermine = inflateUndermine;
*/


/***/ }),

/***/ "a177":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

var utils   = __webpack_require__("be7f");
var trees   = __webpack_require__("07f4");
var adler32 = __webpack_require__("c834");
var crc32   = __webpack_require__("eeda");
var msg     = __webpack_require__("4dc6");

/* Public constants ==========================================================*/
/* ===========================================================================*/


/* Allowed flush values; see deflate() and inflate() below for details */
var Z_NO_FLUSH      = 0;
var Z_PARTIAL_FLUSH = 1;
//var Z_SYNC_FLUSH    = 2;
var Z_FULL_FLUSH    = 3;
var Z_FINISH        = 4;
var Z_BLOCK         = 5;
//var Z_TREES         = 6;


/* Return codes for the compression/decompression functions. Negative values
 * are errors, positive values are used for special but normal events.
 */
var Z_OK            = 0;
var Z_STREAM_END    = 1;
//var Z_NEED_DICT     = 2;
//var Z_ERRNO         = -1;
var Z_STREAM_ERROR  = -2;
var Z_DATA_ERROR    = -3;
//var Z_MEM_ERROR     = -4;
var Z_BUF_ERROR     = -5;
//var Z_VERSION_ERROR = -6;


/* compression levels */
//var Z_NO_COMPRESSION      = 0;
//var Z_BEST_SPEED          = 1;
//var Z_BEST_COMPRESSION    = 9;
var Z_DEFAULT_COMPRESSION = -1;


var Z_FILTERED            = 1;
var Z_HUFFMAN_ONLY        = 2;
var Z_RLE                 = 3;
var Z_FIXED               = 4;
var Z_DEFAULT_STRATEGY    = 0;

/* Possible values of the data_type field (though see inflate()) */
//var Z_BINARY              = 0;
//var Z_TEXT                = 1;
//var Z_ASCII               = 1; // = Z_TEXT
var Z_UNKNOWN             = 2;


/* The deflate compression method */
var Z_DEFLATED  = 8;

/*============================================================================*/


var MAX_MEM_LEVEL = 9;
/* Maximum value for memLevel in deflateInit2 */
var MAX_WBITS = 15;
/* 32K LZ77 window */
var DEF_MEM_LEVEL = 8;


var LENGTH_CODES  = 29;
/* number of length codes, not counting the special END_BLOCK code */
var LITERALS      = 256;
/* number of literal bytes 0..255 */
var L_CODES       = LITERALS + 1 + LENGTH_CODES;
/* number of Literal or Length codes, including the END_BLOCK code */
var D_CODES       = 30;
/* number of distance codes */
var BL_CODES      = 19;
/* number of codes used to transfer the bit lengths */
var HEAP_SIZE     = 2 * L_CODES + 1;
/* maximum heap size */
var MAX_BITS  = 15;
/* All codes must not exceed MAX_BITS bits */

var MIN_MATCH = 3;
var MAX_MATCH = 258;
var MIN_LOOKAHEAD = (MAX_MATCH + MIN_MATCH + 1);

var PRESET_DICT = 0x20;

var INIT_STATE = 42;
var EXTRA_STATE = 69;
var NAME_STATE = 73;
var COMMENT_STATE = 91;
var HCRC_STATE = 103;
var BUSY_STATE = 113;
var FINISH_STATE = 666;

var BS_NEED_MORE      = 1; /* block not completed, need more input or more output */
var BS_BLOCK_DONE     = 2; /* block flush performed */
var BS_FINISH_STARTED = 3; /* finish started, need only more output at next deflate */
var BS_FINISH_DONE    = 4; /* finish done, accept no more input or output */

var OS_CODE = 0x03; // Unix :) . Don't detect, use this default.

function err(strm, errorCode) {
  strm.msg = msg[errorCode];
  return errorCode;
}

function rank(f) {
  return ((f) << 1) - ((f) > 4 ? 9 : 0);
}

function zero(buf) { var len = buf.length; while (--len >= 0) { buf[len] = 0; } }


/* =========================================================================
 * Flush as much pending output as possible. All deflate() output goes
 * through this function so some applications may wish to modify it
 * to avoid allocating a large strm->output buffer and copying into it.
 * (See also read_buf()).
 */
function flush_pending(strm) {
  var s = strm.state;

  //_tr_flush_bits(s);
  var len = s.pending;
  if (len > strm.avail_out) {
    len = strm.avail_out;
  }
  if (len === 0) { return; }

  utils.arraySet(strm.output, s.pending_buf, s.pending_out, len, strm.next_out);
  strm.next_out += len;
  s.pending_out += len;
  strm.total_out += len;
  strm.avail_out -= len;
  s.pending -= len;
  if (s.pending === 0) {
    s.pending_out = 0;
  }
}


function flush_block_only(s, last) {
  trees._tr_flush_block(s, (s.block_start >= 0 ? s.block_start : -1), s.strstart - s.block_start, last);
  s.block_start = s.strstart;
  flush_pending(s.strm);
}


function put_byte(s, b) {
  s.pending_buf[s.pending++] = b;
}


/* =========================================================================
 * Put a short in the pending buffer. The 16-bit value is put in MSB order.
 * IN assertion: the stream state is correct and there is enough room in
 * pending_buf.
 */
function putShortMSB(s, b) {
//  put_byte(s, (Byte)(b >> 8));
//  put_byte(s, (Byte)(b & 0xff));
  s.pending_buf[s.pending++] = (b >>> 8) & 0xff;
  s.pending_buf[s.pending++] = b & 0xff;
}


/* ===========================================================================
 * Read a new buffer from the current input stream, update the adler32
 * and total number of bytes read.  All deflate() input goes through
 * this function so some applications may wish to modify it to avoid
 * allocating a large strm->input buffer and copying from it.
 * (See also flush_pending()).
 */
function read_buf(strm, buf, start, size) {
  var len = strm.avail_in;

  if (len > size) { len = size; }
  if (len === 0) { return 0; }

  strm.avail_in -= len;

  // zmemcpy(buf, strm->next_in, len);
  utils.arraySet(buf, strm.input, strm.next_in, len, start);
  if (strm.state.wrap === 1) {
    strm.adler = adler32(strm.adler, buf, len, start);
  }

  else if (strm.state.wrap === 2) {
    strm.adler = crc32(strm.adler, buf, len, start);
  }

  strm.next_in += len;
  strm.total_in += len;

  return len;
}


/* ===========================================================================
 * Set match_start to the longest match starting at the given string and
 * return its length. Matches shorter or equal to prev_length are discarded,
 * in which case the result is equal to prev_length and match_start is
 * garbage.
 * IN assertions: cur_match is the head of the hash chain for the current
 *   string (strstart) and its distance is <= MAX_DIST, and prev_length >= 1
 * OUT assertion: the match length is not greater than s->lookahead.
 */
function longest_match(s, cur_match) {
  var chain_length = s.max_chain_length;      /* max hash chain length */
  var scan = s.strstart; /* current string */
  var match;                       /* matched string */
  var len;                           /* length of current match */
  var best_len = s.prev_length;              /* best match length so far */
  var nice_match = s.nice_match;             /* stop if match long enough */
  var limit = (s.strstart > (s.w_size - MIN_LOOKAHEAD)) ?
      s.strstart - (s.w_size - MIN_LOOKAHEAD) : 0/*NIL*/;

  var _win = s.window; // shortcut

  var wmask = s.w_mask;
  var prev  = s.prev;

  /* Stop when cur_match becomes <= limit. To simplify the code,
   * we prevent matches with the string of window index 0.
   */

  var strend = s.strstart + MAX_MATCH;
  var scan_end1  = _win[scan + best_len - 1];
  var scan_end   = _win[scan + best_len];

  /* The code is optimized for HASH_BITS >= 8 and MAX_MATCH-2 multiple of 16.
   * It is easy to get rid of this optimization if necessary.
   */
  // Assert(s->hash_bits >= 8 && MAX_MATCH == 258, "Code too clever");

  /* Do not waste too much time if we already have a good match: */
  if (s.prev_length >= s.good_match) {
    chain_length >>= 2;
  }
  /* Do not look for matches beyond the end of the input. This is necessary
   * to make deflate deterministic.
   */
  if (nice_match > s.lookahead) { nice_match = s.lookahead; }

  // Assert((ulg)s->strstart <= s->window_size-MIN_LOOKAHEAD, "need lookahead");

  do {
    // Assert(cur_match < s->strstart, "no future");
    match = cur_match;

    /* Skip to next match if the match length cannot increase
     * or if the match length is less than 2.  Note that the checks below
     * for insufficient lookahead only occur occasionally for performance
     * reasons.  Therefore uninitialized memory will be accessed, and
     * conditional jumps will be made that depend on those values.
     * However the length of the match is limited to the lookahead, so
     * the output of deflate is not affected by the uninitialized values.
     */

    if (_win[match + best_len]     !== scan_end  ||
        _win[match + best_len - 1] !== scan_end1 ||
        _win[match]                !== _win[scan] ||
        _win[++match]              !== _win[scan + 1]) {
      continue;
    }

    /* The check at best_len-1 can be removed because it will be made
     * again later. (This heuristic is not always a win.)
     * It is not necessary to compare scan[2] and match[2] since they
     * are always equal when the other bytes match, given that
     * the hash keys are equal and that HASH_BITS >= 8.
     */
    scan += 2;
    match++;
    // Assert(*scan == *match, "match[2]?");

    /* We check for insufficient lookahead only every 8th comparison;
     * the 256th check will be made at strstart+258.
     */
    do {
      /*jshint noempty:false*/
    } while (_win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&
             _win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&
             _win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&
             _win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&
             scan < strend);

    // Assert(scan <= s->window+(unsigned)(s->window_size-1), "wild scan");

    len = MAX_MATCH - (strend - scan);
    scan = strend - MAX_MATCH;

    if (len > best_len) {
      s.match_start = cur_match;
      best_len = len;
      if (len >= nice_match) {
        break;
      }
      scan_end1  = _win[scan + best_len - 1];
      scan_end   = _win[scan + best_len];
    }
  } while ((cur_match = prev[cur_match & wmask]) > limit && --chain_length !== 0);

  if (best_len <= s.lookahead) {
    return best_len;
  }
  return s.lookahead;
}


/* ===========================================================================
 * Fill the window when the lookahead becomes insufficient.
 * Updates strstart and lookahead.
 *
 * IN assertion: lookahead < MIN_LOOKAHEAD
 * OUT assertions: strstart <= window_size-MIN_LOOKAHEAD
 *    At least one byte has been read, or avail_in == 0; reads are
 *    performed for at least two bytes (required for the zip translate_eol
 *    option -- not supported here).
 */
function fill_window(s) {
  var _w_size = s.w_size;
  var p, n, m, more, str;

  //Assert(s->lookahead < MIN_LOOKAHEAD, "already enough lookahead");

  do {
    more = s.window_size - s.lookahead - s.strstart;

    // JS ints have 32 bit, block below not needed
    /* Deal with !@#$% 64K limit: */
    //if (sizeof(int) <= 2) {
    //    if (more == 0 && s->strstart == 0 && s->lookahead == 0) {
    //        more = wsize;
    //
    //  } else if (more == (unsigned)(-1)) {
    //        /* Very unlikely, but possible on 16 bit machine if
    //         * strstart == 0 && lookahead == 1 (input done a byte at time)
    //         */
    //        more--;
    //    }
    //}


    /* If the window is almost full and there is insufficient lookahead,
     * move the upper half to the lower one to make room in the upper half.
     */
    if (s.strstart >= _w_size + (_w_size - MIN_LOOKAHEAD)) {

      utils.arraySet(s.window, s.window, _w_size, _w_size, 0);
      s.match_start -= _w_size;
      s.strstart -= _w_size;
      /* we now have strstart >= MAX_DIST */
      s.block_start -= _w_size;

      /* Slide the hash table (could be avoided with 32 bit values
       at the expense of memory usage). We slide even when level == 0
       to keep the hash table consistent if we switch back to level > 0
       later. (Using level 0 permanently is not an optimal usage of
       zlib, so we don't care about this pathological case.)
       */

      n = s.hash_size;
      p = n;
      do {
        m = s.head[--p];
        s.head[p] = (m >= _w_size ? m - _w_size : 0);
      } while (--n);

      n = _w_size;
      p = n;
      do {
        m = s.prev[--p];
        s.prev[p] = (m >= _w_size ? m - _w_size : 0);
        /* If n is not on any hash chain, prev[n] is garbage but
         * its value will never be used.
         */
      } while (--n);

      more += _w_size;
    }
    if (s.strm.avail_in === 0) {
      break;
    }

    /* If there was no sliding:
     *    strstart <= WSIZE+MAX_DIST-1 && lookahead <= MIN_LOOKAHEAD - 1 &&
     *    more == window_size - lookahead - strstart
     * => more >= window_size - (MIN_LOOKAHEAD-1 + WSIZE + MAX_DIST-1)
     * => more >= window_size - 2*WSIZE + 2
     * In the BIG_MEM or MMAP case (not yet supported),
     *   window_size == input_size + MIN_LOOKAHEAD  &&
     *   strstart + s->lookahead <= input_size => more >= MIN_LOOKAHEAD.
     * Otherwise, window_size == 2*WSIZE so more >= 2.
     * If there was sliding, more >= WSIZE. So in all cases, more >= 2.
     */
    //Assert(more >= 2, "more < 2");
    n = read_buf(s.strm, s.window, s.strstart + s.lookahead, more);
    s.lookahead += n;

    /* Initialize the hash value now that we have some input: */
    if (s.lookahead + s.insert >= MIN_MATCH) {
      str = s.strstart - s.insert;
      s.ins_h = s.window[str];

      /* UPDATE_HASH(s, s->ins_h, s->window[str + 1]); */
      s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[str + 1]) & s.hash_mask;
//#if MIN_MATCH != 3
//        Call update_hash() MIN_MATCH-3 more times
//#endif
      while (s.insert) {
        /* UPDATE_HASH(s, s->ins_h, s->window[str + MIN_MATCH-1]); */
        s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[str + MIN_MATCH - 1]) & s.hash_mask;

        s.prev[str & s.w_mask] = s.head[s.ins_h];
        s.head[s.ins_h] = str;
        str++;
        s.insert--;
        if (s.lookahead + s.insert < MIN_MATCH) {
          break;
        }
      }
    }
    /* If the whole input has less than MIN_MATCH bytes, ins_h is garbage,
     * but this is not important since only literal bytes will be emitted.
     */

  } while (s.lookahead < MIN_LOOKAHEAD && s.strm.avail_in !== 0);

  /* If the WIN_INIT bytes after the end of the current data have never been
   * written, then zero those bytes in order to avoid memory check reports of
   * the use of uninitialized (or uninitialised as Julian writes) bytes by
   * the longest match routines.  Update the high water mark for the next
   * time through here.  WIN_INIT is set to MAX_MATCH since the longest match
   * routines allow scanning to strstart + MAX_MATCH, ignoring lookahead.
   */
//  if (s.high_water < s.window_size) {
//    var curr = s.strstart + s.lookahead;
//    var init = 0;
//
//    if (s.high_water < curr) {
//      /* Previous high water mark below current data -- zero WIN_INIT
//       * bytes or up to end of window, whichever is less.
//       */
//      init = s.window_size - curr;
//      if (init > WIN_INIT)
//        init = WIN_INIT;
//      zmemzero(s->window + curr, (unsigned)init);
//      s->high_water = curr + init;
//    }
//    else if (s->high_water < (ulg)curr + WIN_INIT) {
//      /* High water mark at or above current data, but below current data
//       * plus WIN_INIT -- zero out to current data plus WIN_INIT, or up
//       * to end of window, whichever is less.
//       */
//      init = (ulg)curr + WIN_INIT - s->high_water;
//      if (init > s->window_size - s->high_water)
//        init = s->window_size - s->high_water;
//      zmemzero(s->window + s->high_water, (unsigned)init);
//      s->high_water += init;
//    }
//  }
//
//  Assert((ulg)s->strstart <= s->window_size - MIN_LOOKAHEAD,
//    "not enough room for search");
}

/* ===========================================================================
 * Copy without compression as much as possible from the input stream, return
 * the current block state.
 * This function does not insert new strings in the dictionary since
 * uncompressible data is probably not useful. This function is used
 * only for the level=0 compression option.
 * NOTE: this function should be optimized to avoid extra copying from
 * window to pending_buf.
 */
function deflate_stored(s, flush) {
  /* Stored blocks are limited to 0xffff bytes, pending_buf is limited
   * to pending_buf_size, and each stored block has a 5 byte header:
   */
  var max_block_size = 0xffff;

  if (max_block_size > s.pending_buf_size - 5) {
    max_block_size = s.pending_buf_size - 5;
  }

  /* Copy as much as possible from input to output: */
  for (;;) {
    /* Fill the window as much as possible: */
    if (s.lookahead <= 1) {

      //Assert(s->strstart < s->w_size+MAX_DIST(s) ||
      //  s->block_start >= (long)s->w_size, "slide too late");
//      if (!(s.strstart < s.w_size + (s.w_size - MIN_LOOKAHEAD) ||
//        s.block_start >= s.w_size)) {
//        throw  new Error("slide too late");
//      }

      fill_window(s);
      if (s.lookahead === 0 && flush === Z_NO_FLUSH) {
        return BS_NEED_MORE;
      }

      if (s.lookahead === 0) {
        break;
      }
      /* flush the current block */
    }
    //Assert(s->block_start >= 0L, "block gone");
//    if (s.block_start < 0) throw new Error("block gone");

    s.strstart += s.lookahead;
    s.lookahead = 0;

    /* Emit a stored block if pending_buf will be full: */
    var max_start = s.block_start + max_block_size;

    if (s.strstart === 0 || s.strstart >= max_start) {
      /* strstart == 0 is possible when wraparound on 16-bit machine */
      s.lookahead = s.strstart - max_start;
      s.strstart = max_start;
      /*** FLUSH_BLOCK(s, 0); ***/
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
      /***/


    }
    /* Flush if we may have to slide, otherwise block_start may become
     * negative and the data will be gone:
     */
    if (s.strstart - s.block_start >= (s.w_size - MIN_LOOKAHEAD)) {
      /*** FLUSH_BLOCK(s, 0); ***/
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
      /***/
    }
  }

  s.insert = 0;

  if (flush === Z_FINISH) {
    /*** FLUSH_BLOCK(s, 1); ***/
    flush_block_only(s, true);
    if (s.strm.avail_out === 0) {
      return BS_FINISH_STARTED;
    }
    /***/
    return BS_FINISH_DONE;
  }

  if (s.strstart > s.block_start) {
    /*** FLUSH_BLOCK(s, 0); ***/
    flush_block_only(s, false);
    if (s.strm.avail_out === 0) {
      return BS_NEED_MORE;
    }
    /***/
  }

  return BS_NEED_MORE;
}

/* ===========================================================================
 * Compress as much as possible from the input stream, return the current
 * block state.
 * This function does not perform lazy evaluation of matches and inserts
 * new strings in the dictionary only for unmatched strings or for short
 * matches. It is used only for the fast compression options.
 */
function deflate_fast(s, flush) {
  var hash_head;        /* head of the hash chain */
  var bflush;           /* set if current block must be flushed */

  for (;;) {
    /* Make sure that we always have enough lookahead, except
     * at the end of the input file. We need MAX_MATCH bytes
     * for the next match, plus MIN_MATCH bytes to insert the
     * string following the next match.
     */
    if (s.lookahead < MIN_LOOKAHEAD) {
      fill_window(s);
      if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH) {
        return BS_NEED_MORE;
      }
      if (s.lookahead === 0) {
        break; /* flush the current block */
      }
    }

    /* Insert the string window[strstart .. strstart+2] in the
     * dictionary, and set hash_head to the head of the hash chain:
     */
    hash_head = 0/*NIL*/;
    if (s.lookahead >= MIN_MATCH) {
      /*** INSERT_STRING(s, s.strstart, hash_head); ***/
      s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
      hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
      s.head[s.ins_h] = s.strstart;
      /***/
    }

    /* Find the longest match, discarding those <= prev_length.
     * At this point we have always match_length < MIN_MATCH
     */
    if (hash_head !== 0/*NIL*/ && ((s.strstart - hash_head) <= (s.w_size - MIN_LOOKAHEAD))) {
      /* To simplify the code, we prevent matches with the string
       * of window index 0 (in particular we have to avoid a match
       * of the string with itself at the start of the input file).
       */
      s.match_length = longest_match(s, hash_head);
      /* longest_match() sets match_start */
    }
    if (s.match_length >= MIN_MATCH) {
      // check_match(s, s.strstart, s.match_start, s.match_length); // for debug only

      /*** _tr_tally_dist(s, s.strstart - s.match_start,
                     s.match_length - MIN_MATCH, bflush); ***/
      bflush = trees._tr_tally(s, s.strstart - s.match_start, s.match_length - MIN_MATCH);

      s.lookahead -= s.match_length;

      /* Insert new strings in the hash table only if the match length
       * is not too large. This saves time but degrades compression.
       */
      if (s.match_length <= s.max_lazy_match/*max_insert_length*/ && s.lookahead >= MIN_MATCH) {
        s.match_length--; /* string at strstart already in table */
        do {
          s.strstart++;
          /*** INSERT_STRING(s, s.strstart, hash_head); ***/
          s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
          hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
          s.head[s.ins_h] = s.strstart;
          /***/
          /* strstart never exceeds WSIZE-MAX_MATCH, so there are
           * always MIN_MATCH bytes ahead.
           */
        } while (--s.match_length !== 0);
        s.strstart++;
      } else
      {
        s.strstart += s.match_length;
        s.match_length = 0;
        s.ins_h = s.window[s.strstart];
        /* UPDATE_HASH(s, s.ins_h, s.window[s.strstart+1]); */
        s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + 1]) & s.hash_mask;

//#if MIN_MATCH != 3
//                Call UPDATE_HASH() MIN_MATCH-3 more times
//#endif
        /* If lookahead < MIN_MATCH, ins_h is garbage, but it does not
         * matter since it will be recomputed at next deflate call.
         */
      }
    } else {
      /* No match, output a literal byte */
      //Tracevv((stderr,"%c", s.window[s.strstart]));
      /*** _tr_tally_lit(s, s.window[s.strstart], bflush); ***/
      bflush = trees._tr_tally(s, 0, s.window[s.strstart]);

      s.lookahead--;
      s.strstart++;
    }
    if (bflush) {
      /*** FLUSH_BLOCK(s, 0); ***/
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
      /***/
    }
  }
  s.insert = ((s.strstart < (MIN_MATCH - 1)) ? s.strstart : MIN_MATCH - 1);
  if (flush === Z_FINISH) {
    /*** FLUSH_BLOCK(s, 1); ***/
    flush_block_only(s, true);
    if (s.strm.avail_out === 0) {
      return BS_FINISH_STARTED;
    }
    /***/
    return BS_FINISH_DONE;
  }
  if (s.last_lit) {
    /*** FLUSH_BLOCK(s, 0); ***/
    flush_block_only(s, false);
    if (s.strm.avail_out === 0) {
      return BS_NEED_MORE;
    }
    /***/
  }
  return BS_BLOCK_DONE;
}

/* ===========================================================================
 * Same as above, but achieves better compression. We use a lazy
 * evaluation for matches: a match is finally adopted only if there is
 * no better match at the next window position.
 */
function deflate_slow(s, flush) {
  var hash_head;          /* head of hash chain */
  var bflush;              /* set if current block must be flushed */

  var max_insert;

  /* Process the input block. */
  for (;;) {
    /* Make sure that we always have enough lookahead, except
     * at the end of the input file. We need MAX_MATCH bytes
     * for the next match, plus MIN_MATCH bytes to insert the
     * string following the next match.
     */
    if (s.lookahead < MIN_LOOKAHEAD) {
      fill_window(s);
      if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH) {
        return BS_NEED_MORE;
      }
      if (s.lookahead === 0) { break; } /* flush the current block */
    }

    /* Insert the string window[strstart .. strstart+2] in the
     * dictionary, and set hash_head to the head of the hash chain:
     */
    hash_head = 0/*NIL*/;
    if (s.lookahead >= MIN_MATCH) {
      /*** INSERT_STRING(s, s.strstart, hash_head); ***/
      s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
      hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
      s.head[s.ins_h] = s.strstart;
      /***/
    }

    /* Find the longest match, discarding those <= prev_length.
     */
    s.prev_length = s.match_length;
    s.prev_match = s.match_start;
    s.match_length = MIN_MATCH - 1;

    if (hash_head !== 0/*NIL*/ && s.prev_length < s.max_lazy_match &&
        s.strstart - hash_head <= (s.w_size - MIN_LOOKAHEAD)/*MAX_DIST(s)*/) {
      /* To simplify the code, we prevent matches with the string
       * of window index 0 (in particular we have to avoid a match
       * of the string with itself at the start of the input file).
       */
      s.match_length = longest_match(s, hash_head);
      /* longest_match() sets match_start */

      if (s.match_length <= 5 &&
         (s.strategy === Z_FILTERED || (s.match_length === MIN_MATCH && s.strstart - s.match_start > 4096/*TOO_FAR*/))) {

        /* If prev_match is also MIN_MATCH, match_start is garbage
         * but we will ignore the current match anyway.
         */
        s.match_length = MIN_MATCH - 1;
      }
    }
    /* If there was a match at the previous step and the current
     * match is not better, output the previous match:
     */
    if (s.prev_length >= MIN_MATCH && s.match_length <= s.prev_length) {
      max_insert = s.strstart + s.lookahead - MIN_MATCH;
      /* Do not insert strings in hash table beyond this. */

      //check_match(s, s.strstart-1, s.prev_match, s.prev_length);

      /***_tr_tally_dist(s, s.strstart - 1 - s.prev_match,
                     s.prev_length - MIN_MATCH, bflush);***/
      bflush = trees._tr_tally(s, s.strstart - 1 - s.prev_match, s.prev_length - MIN_MATCH);
      /* Insert in hash table all strings up to the end of the match.
       * strstart-1 and strstart are already inserted. If there is not
       * enough lookahead, the last two strings are not inserted in
       * the hash table.
       */
      s.lookahead -= s.prev_length - 1;
      s.prev_length -= 2;
      do {
        if (++s.strstart <= max_insert) {
          /*** INSERT_STRING(s, s.strstart, hash_head); ***/
          s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
          hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
          s.head[s.ins_h] = s.strstart;
          /***/
        }
      } while (--s.prev_length !== 0);
      s.match_available = 0;
      s.match_length = MIN_MATCH - 1;
      s.strstart++;

      if (bflush) {
        /*** FLUSH_BLOCK(s, 0); ***/
        flush_block_only(s, false);
        if (s.strm.avail_out === 0) {
          return BS_NEED_MORE;
        }
        /***/
      }

    } else if (s.match_available) {
      /* If there was no match at the previous position, output a
       * single literal. If there was a match but the current match
       * is longer, truncate the previous match to a single literal.
       */
      //Tracevv((stderr,"%c", s->window[s->strstart-1]));
      /*** _tr_tally_lit(s, s.window[s.strstart-1], bflush); ***/
      bflush = trees._tr_tally(s, 0, s.window[s.strstart - 1]);

      if (bflush) {
        /*** FLUSH_BLOCK_ONLY(s, 0) ***/
        flush_block_only(s, false);
        /***/
      }
      s.strstart++;
      s.lookahead--;
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
    } else {
      /* There is no previous match to compare with, wait for
       * the next step to decide.
       */
      s.match_available = 1;
      s.strstart++;
      s.lookahead--;
    }
  }
  //Assert (flush != Z_NO_FLUSH, "no flush?");
  if (s.match_available) {
    //Tracevv((stderr,"%c", s->window[s->strstart-1]));
    /*** _tr_tally_lit(s, s.window[s.strstart-1], bflush); ***/
    bflush = trees._tr_tally(s, 0, s.window[s.strstart - 1]);

    s.match_available = 0;
  }
  s.insert = s.strstart < MIN_MATCH - 1 ? s.strstart : MIN_MATCH - 1;
  if (flush === Z_FINISH) {
    /*** FLUSH_BLOCK(s, 1); ***/
    flush_block_only(s, true);
    if (s.strm.avail_out === 0) {
      return BS_FINISH_STARTED;
    }
    /***/
    return BS_FINISH_DONE;
  }
  if (s.last_lit) {
    /*** FLUSH_BLOCK(s, 0); ***/
    flush_block_only(s, false);
    if (s.strm.avail_out === 0) {
      return BS_NEED_MORE;
    }
    /***/
  }

  return BS_BLOCK_DONE;
}


/* ===========================================================================
 * For Z_RLE, simply look for runs of bytes, generate matches only of distance
 * one.  Do not maintain a hash table.  (It will be regenerated if this run of
 * deflate switches away from Z_RLE.)
 */
function deflate_rle(s, flush) {
  var bflush;            /* set if current block must be flushed */
  var prev;              /* byte at distance one to match */
  var scan, strend;      /* scan goes up to strend for length of run */

  var _win = s.window;

  for (;;) {
    /* Make sure that we always have enough lookahead, except
     * at the end of the input file. We need MAX_MATCH bytes
     * for the longest run, plus one for the unrolled loop.
     */
    if (s.lookahead <= MAX_MATCH) {
      fill_window(s);
      if (s.lookahead <= MAX_MATCH && flush === Z_NO_FLUSH) {
        return BS_NEED_MORE;
      }
      if (s.lookahead === 0) { break; } /* flush the current block */
    }

    /* See how many times the previous byte repeats */
    s.match_length = 0;
    if (s.lookahead >= MIN_MATCH && s.strstart > 0) {
      scan = s.strstart - 1;
      prev = _win[scan];
      if (prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan]) {
        strend = s.strstart + MAX_MATCH;
        do {
          /*jshint noempty:false*/
        } while (prev === _win[++scan] && prev === _win[++scan] &&
                 prev === _win[++scan] && prev === _win[++scan] &&
                 prev === _win[++scan] && prev === _win[++scan] &&
                 prev === _win[++scan] && prev === _win[++scan] &&
                 scan < strend);
        s.match_length = MAX_MATCH - (strend - scan);
        if (s.match_length > s.lookahead) {
          s.match_length = s.lookahead;
        }
      }
      //Assert(scan <= s->window+(uInt)(s->window_size-1), "wild scan");
    }

    /* Emit match if have run of MIN_MATCH or longer, else emit literal */
    if (s.match_length >= MIN_MATCH) {
      //check_match(s, s.strstart, s.strstart - 1, s.match_length);

      /*** _tr_tally_dist(s, 1, s.match_length - MIN_MATCH, bflush); ***/
      bflush = trees._tr_tally(s, 1, s.match_length - MIN_MATCH);

      s.lookahead -= s.match_length;
      s.strstart += s.match_length;
      s.match_length = 0;
    } else {
      /* No match, output a literal byte */
      //Tracevv((stderr,"%c", s->window[s->strstart]));
      /*** _tr_tally_lit(s, s.window[s.strstart], bflush); ***/
      bflush = trees._tr_tally(s, 0, s.window[s.strstart]);

      s.lookahead--;
      s.strstart++;
    }
    if (bflush) {
      /*** FLUSH_BLOCK(s, 0); ***/
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
      /***/
    }
  }
  s.insert = 0;
  if (flush === Z_FINISH) {
    /*** FLUSH_BLOCK(s, 1); ***/
    flush_block_only(s, true);
    if (s.strm.avail_out === 0) {
      return BS_FINISH_STARTED;
    }
    /***/
    return BS_FINISH_DONE;
  }
  if (s.last_lit) {
    /*** FLUSH_BLOCK(s, 0); ***/
    flush_block_only(s, false);
    if (s.strm.avail_out === 0) {
      return BS_NEED_MORE;
    }
    /***/
  }
  return BS_BLOCK_DONE;
}

/* ===========================================================================
 * For Z_HUFFMAN_ONLY, do not look for matches.  Do not maintain a hash table.
 * (It will be regenerated if this run of deflate switches away from Huffman.)
 */
function deflate_huff(s, flush) {
  var bflush;             /* set if current block must be flushed */

  for (;;) {
    /* Make sure that we have a literal to write. */
    if (s.lookahead === 0) {
      fill_window(s);
      if (s.lookahead === 0) {
        if (flush === Z_NO_FLUSH) {
          return BS_NEED_MORE;
        }
        break;      /* flush the current block */
      }
    }

    /* Output a literal byte */
    s.match_length = 0;
    //Tracevv((stderr,"%c", s->window[s->strstart]));
    /*** _tr_tally_lit(s, s.window[s.strstart], bflush); ***/
    bflush = trees._tr_tally(s, 0, s.window[s.strstart]);
    s.lookahead--;
    s.strstart++;
    if (bflush) {
      /*** FLUSH_BLOCK(s, 0); ***/
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
      /***/
    }
  }
  s.insert = 0;
  if (flush === Z_FINISH) {
    /*** FLUSH_BLOCK(s, 1); ***/
    flush_block_only(s, true);
    if (s.strm.avail_out === 0) {
      return BS_FINISH_STARTED;
    }
    /***/
    return BS_FINISH_DONE;
  }
  if (s.last_lit) {
    /*** FLUSH_BLOCK(s, 0); ***/
    flush_block_only(s, false);
    if (s.strm.avail_out === 0) {
      return BS_NEED_MORE;
    }
    /***/
  }
  return BS_BLOCK_DONE;
}

/* Values for max_lazy_match, good_match and max_chain_length, depending on
 * the desired pack level (0..9). The values given below have been tuned to
 * exclude worst case performance for pathological files. Better values may be
 * found for specific files.
 */
function Config(good_length, max_lazy, nice_length, max_chain, func) {
  this.good_length = good_length;
  this.max_lazy = max_lazy;
  this.nice_length = nice_length;
  this.max_chain = max_chain;
  this.func = func;
}

var configuration_table;

configuration_table = [
  /*      good lazy nice chain */
  new Config(0, 0, 0, 0, deflate_stored),          /* 0 store only */
  new Config(4, 4, 8, 4, deflate_fast),            /* 1 max speed, no lazy matches */
  new Config(4, 5, 16, 8, deflate_fast),           /* 2 */
  new Config(4, 6, 32, 32, deflate_fast),          /* 3 */

  new Config(4, 4, 16, 16, deflate_slow),          /* 4 lazy matches */
  new Config(8, 16, 32, 32, deflate_slow),         /* 5 */
  new Config(8, 16, 128, 128, deflate_slow),       /* 6 */
  new Config(8, 32, 128, 256, deflate_slow),       /* 7 */
  new Config(32, 128, 258, 1024, deflate_slow),    /* 8 */
  new Config(32, 258, 258, 4096, deflate_slow)     /* 9 max compression */
];


/* ===========================================================================
 * Initialize the "longest match" routines for a new zlib stream
 */
function lm_init(s) {
  s.window_size = 2 * s.w_size;

  /*** CLEAR_HASH(s); ***/
  zero(s.head); // Fill with NIL (= 0);

  /* Set the default configuration parameters:
   */
  s.max_lazy_match = configuration_table[s.level].max_lazy;
  s.good_match = configuration_table[s.level].good_length;
  s.nice_match = configuration_table[s.level].nice_length;
  s.max_chain_length = configuration_table[s.level].max_chain;

  s.strstart = 0;
  s.block_start = 0;
  s.lookahead = 0;
  s.insert = 0;
  s.match_length = s.prev_length = MIN_MATCH - 1;
  s.match_available = 0;
  s.ins_h = 0;
}


function DeflateState() {
  this.strm = null;            /* pointer back to this zlib stream */
  this.status = 0;            /* as the name implies */
  this.pending_buf = null;      /* output still pending */
  this.pending_buf_size = 0;  /* size of pending_buf */
  this.pending_out = 0;       /* next pending byte to output to the stream */
  this.pending = 0;           /* nb of bytes in the pending buffer */
  this.wrap = 0;              /* bit 0 true for zlib, bit 1 true for gzip */
  this.gzhead = null;         /* gzip header information to write */
  this.gzindex = 0;           /* where in extra, name, or comment */
  this.method = Z_DEFLATED; /* can only be DEFLATED */
  this.last_flush = -1;   /* value of flush param for previous deflate call */

  this.w_size = 0;  /* LZ77 window size (32K by default) */
  this.w_bits = 0;  /* log2(w_size)  (8..16) */
  this.w_mask = 0;  /* w_size - 1 */

  this.window = null;
  /* Sliding window. Input bytes are read into the second half of the window,
   * and move to the first half later to keep a dictionary of at least wSize
   * bytes. With this organization, matches are limited to a distance of
   * wSize-MAX_MATCH bytes, but this ensures that IO is always
   * performed with a length multiple of the block size.
   */

  this.window_size = 0;
  /* Actual size of window: 2*wSize, except when the user input buffer
   * is directly used as sliding window.
   */

  this.prev = null;
  /* Link to older string with same hash index. To limit the size of this
   * array to 64K, this link is maintained only for the last 32K strings.
   * An index in this array is thus a window index modulo 32K.
   */

  this.head = null;   /* Heads of the hash chains or NIL. */

  this.ins_h = 0;       /* hash index of string to be inserted */
  this.hash_size = 0;   /* number of elements in hash table */
  this.hash_bits = 0;   /* log2(hash_size) */
  this.hash_mask = 0;   /* hash_size-1 */

  this.hash_shift = 0;
  /* Number of bits by which ins_h must be shifted at each input
   * step. It must be such that after MIN_MATCH steps, the oldest
   * byte no longer takes part in the hash key, that is:
   *   hash_shift * MIN_MATCH >= hash_bits
   */

  this.block_start = 0;
  /* Window position at the beginning of the current output block. Gets
   * negative when the window is moved backwards.
   */

  this.match_length = 0;      /* length of best match */
  this.prev_match = 0;        /* previous match */
  this.match_available = 0;   /* set if previous match exists */
  this.strstart = 0;          /* start of string to insert */
  this.match_start = 0;       /* start of matching string */
  this.lookahead = 0;         /* number of valid bytes ahead in window */

  this.prev_length = 0;
  /* Length of the best match at previous step. Matches not greater than this
   * are discarded. This is used in the lazy match evaluation.
   */

  this.max_chain_length = 0;
  /* To speed up deflation, hash chains are never searched beyond this
   * length.  A higher limit improves compression ratio but degrades the
   * speed.
   */

  this.max_lazy_match = 0;
  /* Attempt to find a better match only when the current match is strictly
   * smaller than this value. This mechanism is used only for compression
   * levels >= 4.
   */
  // That's alias to max_lazy_match, don't use directly
  //this.max_insert_length = 0;
  /* Insert new strings in the hash table only if the match length is not
   * greater than this length. This saves time but degrades compression.
   * max_insert_length is used only for compression levels <= 3.
   */

  this.level = 0;     /* compression level (1..9) */
  this.strategy = 0;  /* favor or force Huffman coding*/

  this.good_match = 0;
  /* Use a faster search when the previous match is longer than this */

  this.nice_match = 0; /* Stop searching when current match exceeds this */

              /* used by trees.c: */

  /* Didn't use ct_data typedef below to suppress compiler warning */

  // struct ct_data_s dyn_ltree[HEAP_SIZE];   /* literal and length tree */
  // struct ct_data_s dyn_dtree[2*D_CODES+1]; /* distance tree */
  // struct ct_data_s bl_tree[2*BL_CODES+1];  /* Huffman tree for bit lengths */

  // Use flat array of DOUBLE size, with interleaved fata,
  // because JS does not support effective
  this.dyn_ltree  = new utils.Buf16(HEAP_SIZE * 2);
  this.dyn_dtree  = new utils.Buf16((2 * D_CODES + 1) * 2);
  this.bl_tree    = new utils.Buf16((2 * BL_CODES + 1) * 2);
  zero(this.dyn_ltree);
  zero(this.dyn_dtree);
  zero(this.bl_tree);

  this.l_desc   = null;         /* desc. for literal tree */
  this.d_desc   = null;         /* desc. for distance tree */
  this.bl_desc  = null;         /* desc. for bit length tree */

  //ush bl_count[MAX_BITS+1];
  this.bl_count = new utils.Buf16(MAX_BITS + 1);
  /* number of codes at each bit length for an optimal tree */

  //int heap[2*L_CODES+1];      /* heap used to build the Huffman trees */
  this.heap = new utils.Buf16(2 * L_CODES + 1);  /* heap used to build the Huffman trees */
  zero(this.heap);

  this.heap_len = 0;               /* number of elements in the heap */
  this.heap_max = 0;               /* element of largest frequency */
  /* The sons of heap[n] are heap[2*n] and heap[2*n+1]. heap[0] is not used.
   * The same heap array is used to build all trees.
   */

  this.depth = new utils.Buf16(2 * L_CODES + 1); //uch depth[2*L_CODES+1];
  zero(this.depth);
  /* Depth of each subtree used as tie breaker for trees of equal frequency
   */

  this.l_buf = 0;          /* buffer index for literals or lengths */

  this.lit_bufsize = 0;
  /* Size of match buffer for literals/lengths.  There are 4 reasons for
   * limiting lit_bufsize to 64K:
   *   - frequencies can be kept in 16 bit counters
   *   - if compression is not successful for the first block, all input
   *     data is still in the window so we can still emit a stored block even
   *     when input comes from standard input.  (This can also be done for
   *     all blocks if lit_bufsize is not greater than 32K.)
   *   - if compression is not successful for a file smaller than 64K, we can
   *     even emit a stored file instead of a stored block (saving 5 bytes).
   *     This is applicable only for zip (not gzip or zlib).
   *   - creating new Huffman trees less frequently may not provide fast
   *     adaptation to changes in the input data statistics. (Take for
   *     example a binary file with poorly compressible code followed by
   *     a highly compressible string table.) Smaller buffer sizes give
   *     fast adaptation but have of course the overhead of transmitting
   *     trees more frequently.
   *   - I can't count above 4
   */

  this.last_lit = 0;      /* running index in l_buf */

  this.d_buf = 0;
  /* Buffer index for distances. To simplify the code, d_buf and l_buf have
   * the same number of elements. To use different lengths, an extra flag
   * array would be necessary.
   */

  this.opt_len = 0;       /* bit length of current block with optimal trees */
  this.static_len = 0;    /* bit length of current block with static trees */
  this.matches = 0;       /* number of string matches in current block */
  this.insert = 0;        /* bytes at end of window left to insert */


  this.bi_buf = 0;
  /* Output buffer. bits are inserted starting at the bottom (least
   * significant bits).
   */
  this.bi_valid = 0;
  /* Number of valid bits in bi_buf.  All bits above the last valid bit
   * are always zero.
   */

  // Used for window memory init. We safely ignore it for JS. That makes
  // sense only for pointers and memory check tools.
  //this.high_water = 0;
  /* High water mark offset in window for initialized bytes -- bytes above
   * this are set to zero in order to avoid memory check warnings when
   * longest match routines access bytes past the input.  This is then
   * updated to the new high water mark.
   */
}


function deflateResetKeep(strm) {
  var s;

  if (!strm || !strm.state) {
    return err(strm, Z_STREAM_ERROR);
  }

  strm.total_in = strm.total_out = 0;
  strm.data_type = Z_UNKNOWN;

  s = strm.state;
  s.pending = 0;
  s.pending_out = 0;

  if (s.wrap < 0) {
    s.wrap = -s.wrap;
    /* was made negative by deflate(..., Z_FINISH); */
  }
  s.status = (s.wrap ? INIT_STATE : BUSY_STATE);
  strm.adler = (s.wrap === 2) ?
    0  // crc32(0, Z_NULL, 0)
  :
    1; // adler32(0, Z_NULL, 0)
  s.last_flush = Z_NO_FLUSH;
  trees._tr_init(s);
  return Z_OK;
}


function deflateReset(strm) {
  var ret = deflateResetKeep(strm);
  if (ret === Z_OK) {
    lm_init(strm.state);
  }
  return ret;
}


function deflateSetHeader(strm, head) {
  if (!strm || !strm.state) { return Z_STREAM_ERROR; }
  if (strm.state.wrap !== 2) { return Z_STREAM_ERROR; }
  strm.state.gzhead = head;
  return Z_OK;
}


function deflateInit2(strm, level, method, windowBits, memLevel, strategy) {
  if (!strm) { // === Z_NULL
    return Z_STREAM_ERROR;
  }
  var wrap = 1;

  if (level === Z_DEFAULT_COMPRESSION) {
    level = 6;
  }

  if (windowBits < 0) { /* suppress zlib wrapper */
    wrap = 0;
    windowBits = -windowBits;
  }

  else if (windowBits > 15) {
    wrap = 2;           /* write gzip wrapper instead */
    windowBits -= 16;
  }


  if (memLevel < 1 || memLevel > MAX_MEM_LEVEL || method !== Z_DEFLATED ||
    windowBits < 8 || windowBits > 15 || level < 0 || level > 9 ||
    strategy < 0 || strategy > Z_FIXED) {
    return err(strm, Z_STREAM_ERROR);
  }


  if (windowBits === 8) {
    windowBits = 9;
  }
  /* until 256-byte window bug fixed */

  var s = new DeflateState();

  strm.state = s;
  s.strm = strm;

  s.wrap = wrap;
  s.gzhead = null;
  s.w_bits = windowBits;
  s.w_size = 1 << s.w_bits;
  s.w_mask = s.w_size - 1;

  s.hash_bits = memLevel + 7;
  s.hash_size = 1 << s.hash_bits;
  s.hash_mask = s.hash_size - 1;
  s.hash_shift = ~~((s.hash_bits + MIN_MATCH - 1) / MIN_MATCH);

  s.window = new utils.Buf8(s.w_size * 2);
  s.head = new utils.Buf16(s.hash_size);
  s.prev = new utils.Buf16(s.w_size);

  // Don't need mem init magic for JS.
  //s.high_water = 0;  /* nothing written to s->window yet */

  s.lit_bufsize = 1 << (memLevel + 6); /* 16K elements by default */

  s.pending_buf_size = s.lit_bufsize * 4;

  //overlay = (ushf *) ZALLOC(strm, s->lit_bufsize, sizeof(ush)+2);
  //s->pending_buf = (uchf *) overlay;
  s.pending_buf = new utils.Buf8(s.pending_buf_size);

  // It is offset from `s.pending_buf` (size is `s.lit_bufsize * 2`)
  //s->d_buf = overlay + s->lit_bufsize/sizeof(ush);
  s.d_buf = 1 * s.lit_bufsize;

  //s->l_buf = s->pending_buf + (1+sizeof(ush))*s->lit_bufsize;
  s.l_buf = (1 + 2) * s.lit_bufsize;

  s.level = level;
  s.strategy = strategy;
  s.method = method;

  return deflateReset(strm);
}

function deflateInit(strm, level) {
  return deflateInit2(strm, level, Z_DEFLATED, MAX_WBITS, DEF_MEM_LEVEL, Z_DEFAULT_STRATEGY);
}


function deflate(strm, flush) {
  var old_flush, s;
  var beg, val; // for gzip header write only

  if (!strm || !strm.state ||
    flush > Z_BLOCK || flush < 0) {
    return strm ? err(strm, Z_STREAM_ERROR) : Z_STREAM_ERROR;
  }

  s = strm.state;

  if (!strm.output ||
      (!strm.input && strm.avail_in !== 0) ||
      (s.status === FINISH_STATE && flush !== Z_FINISH)) {
    return err(strm, (strm.avail_out === 0) ? Z_BUF_ERROR : Z_STREAM_ERROR);
  }

  s.strm = strm; /* just in case */
  old_flush = s.last_flush;
  s.last_flush = flush;

  /* Write the header */
  if (s.status === INIT_STATE) {

    if (s.wrap === 2) { // GZIP header
      strm.adler = 0;  //crc32(0L, Z_NULL, 0);
      put_byte(s, 31);
      put_byte(s, 139);
      put_byte(s, 8);
      if (!s.gzhead) { // s->gzhead == Z_NULL
        put_byte(s, 0);
        put_byte(s, 0);
        put_byte(s, 0);
        put_byte(s, 0);
        put_byte(s, 0);
        put_byte(s, s.level === 9 ? 2 :
                    (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2 ?
                     4 : 0));
        put_byte(s, OS_CODE);
        s.status = BUSY_STATE;
      }
      else {
        put_byte(s, (s.gzhead.text ? 1 : 0) +
                    (s.gzhead.hcrc ? 2 : 0) +
                    (!s.gzhead.extra ? 0 : 4) +
                    (!s.gzhead.name ? 0 : 8) +
                    (!s.gzhead.comment ? 0 : 16)
                );
        put_byte(s, s.gzhead.time & 0xff);
        put_byte(s, (s.gzhead.time >> 8) & 0xff);
        put_byte(s, (s.gzhead.time >> 16) & 0xff);
        put_byte(s, (s.gzhead.time >> 24) & 0xff);
        put_byte(s, s.level === 9 ? 2 :
                    (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2 ?
                     4 : 0));
        put_byte(s, s.gzhead.os & 0xff);
        if (s.gzhead.extra && s.gzhead.extra.length) {
          put_byte(s, s.gzhead.extra.length & 0xff);
          put_byte(s, (s.gzhead.extra.length >> 8) & 0xff);
        }
        if (s.gzhead.hcrc) {
          strm.adler = crc32(strm.adler, s.pending_buf, s.pending, 0);
        }
        s.gzindex = 0;
        s.status = EXTRA_STATE;
      }
    }
    else // DEFLATE header
    {
      var header = (Z_DEFLATED + ((s.w_bits - 8) << 4)) << 8;
      var level_flags = -1;

      if (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2) {
        level_flags = 0;
      } else if (s.level < 6) {
        level_flags = 1;
      } else if (s.level === 6) {
        level_flags = 2;
      } else {
        level_flags = 3;
      }
      header |= (level_flags << 6);
      if (s.strstart !== 0) { header |= PRESET_DICT; }
      header += 31 - (header % 31);

      s.status = BUSY_STATE;
      putShortMSB(s, header);

      /* Save the adler32 of the preset dictionary: */
      if (s.strstart !== 0) {
        putShortMSB(s, strm.adler >>> 16);
        putShortMSB(s, strm.adler & 0xffff);
      }
      strm.adler = 1; // adler32(0L, Z_NULL, 0);
    }
  }

//#ifdef GZIP
  if (s.status === EXTRA_STATE) {
    if (s.gzhead.extra/* != Z_NULL*/) {
      beg = s.pending;  /* start of bytes to update crc */

      while (s.gzindex < (s.gzhead.extra.length & 0xffff)) {
        if (s.pending === s.pending_buf_size) {
          if (s.gzhead.hcrc && s.pending > beg) {
            strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
          }
          flush_pending(strm);
          beg = s.pending;
          if (s.pending === s.pending_buf_size) {
            break;
          }
        }
        put_byte(s, s.gzhead.extra[s.gzindex] & 0xff);
        s.gzindex++;
      }
      if (s.gzhead.hcrc && s.pending > beg) {
        strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
      }
      if (s.gzindex === s.gzhead.extra.length) {
        s.gzindex = 0;
        s.status = NAME_STATE;
      }
    }
    else {
      s.status = NAME_STATE;
    }
  }
  if (s.status === NAME_STATE) {
    if (s.gzhead.name/* != Z_NULL*/) {
      beg = s.pending;  /* start of bytes to update crc */
      //int val;

      do {
        if (s.pending === s.pending_buf_size) {
          if (s.gzhead.hcrc && s.pending > beg) {
            strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
          }
          flush_pending(strm);
          beg = s.pending;
          if (s.pending === s.pending_buf_size) {
            val = 1;
            break;
          }
        }
        // JS specific: little magic to add zero terminator to end of string
        if (s.gzindex < s.gzhead.name.length) {
          val = s.gzhead.name.charCodeAt(s.gzindex++) & 0xff;
        } else {
          val = 0;
        }
        put_byte(s, val);
      } while (val !== 0);

      if (s.gzhead.hcrc && s.pending > beg) {
        strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
      }
      if (val === 0) {
        s.gzindex = 0;
        s.status = COMMENT_STATE;
      }
    }
    else {
      s.status = COMMENT_STATE;
    }
  }
  if (s.status === COMMENT_STATE) {
    if (s.gzhead.comment/* != Z_NULL*/) {
      beg = s.pending;  /* start of bytes to update crc */
      //int val;

      do {
        if (s.pending === s.pending_buf_size) {
          if (s.gzhead.hcrc && s.pending > beg) {
            strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
          }
          flush_pending(strm);
          beg = s.pending;
          if (s.pending === s.pending_buf_size) {
            val = 1;
            break;
          }
        }
        // JS specific: little magic to add zero terminator to end of string
        if (s.gzindex < s.gzhead.comment.length) {
          val = s.gzhead.comment.charCodeAt(s.gzindex++) & 0xff;
        } else {
          val = 0;
        }
        put_byte(s, val);
      } while (val !== 0);

      if (s.gzhead.hcrc && s.pending > beg) {
        strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
      }
      if (val === 0) {
        s.status = HCRC_STATE;
      }
    }
    else {
      s.status = HCRC_STATE;
    }
  }
  if (s.status === HCRC_STATE) {
    if (s.gzhead.hcrc) {
      if (s.pending + 2 > s.pending_buf_size) {
        flush_pending(strm);
      }
      if (s.pending + 2 <= s.pending_buf_size) {
        put_byte(s, strm.adler & 0xff);
        put_byte(s, (strm.adler >> 8) & 0xff);
        strm.adler = 0; //crc32(0L, Z_NULL, 0);
        s.status = BUSY_STATE;
      }
    }
    else {
      s.status = BUSY_STATE;
    }
  }
//#endif

  /* Flush as much pending output as possible */
  if (s.pending !== 0) {
    flush_pending(strm);
    if (strm.avail_out === 0) {
      /* Since avail_out is 0, deflate will be called again with
       * more output space, but possibly with both pending and
       * avail_in equal to zero. There won't be anything to do,
       * but this is not an error situation so make sure we
       * return OK instead of BUF_ERROR at next call of deflate:
       */
      s.last_flush = -1;
      return Z_OK;
    }

    /* Make sure there is something to do and avoid duplicate consecutive
     * flushes. For repeated and useless calls with Z_FINISH, we keep
     * returning Z_STREAM_END instead of Z_BUF_ERROR.
     */
  } else if (strm.avail_in === 0 && rank(flush) <= rank(old_flush) &&
    flush !== Z_FINISH) {
    return err(strm, Z_BUF_ERROR);
  }

  /* User must not provide more input after the first FINISH: */
  if (s.status === FINISH_STATE && strm.avail_in !== 0) {
    return err(strm, Z_BUF_ERROR);
  }

  /* Start a new block or continue the current one.
   */
  if (strm.avail_in !== 0 || s.lookahead !== 0 ||
    (flush !== Z_NO_FLUSH && s.status !== FINISH_STATE)) {
    var bstate = (s.strategy === Z_HUFFMAN_ONLY) ? deflate_huff(s, flush) :
      (s.strategy === Z_RLE ? deflate_rle(s, flush) :
        configuration_table[s.level].func(s, flush));

    if (bstate === BS_FINISH_STARTED || bstate === BS_FINISH_DONE) {
      s.status = FINISH_STATE;
    }
    if (bstate === BS_NEED_MORE || bstate === BS_FINISH_STARTED) {
      if (strm.avail_out === 0) {
        s.last_flush = -1;
        /* avoid BUF_ERROR next call, see above */
      }
      return Z_OK;
      /* If flush != Z_NO_FLUSH && avail_out == 0, the next call
       * of deflate should use the same flush parameter to make sure
       * that the flush is complete. So we don't have to output an
       * empty block here, this will be done at next call. This also
       * ensures that for a very small output buffer, we emit at most
       * one empty block.
       */
    }
    if (bstate === BS_BLOCK_DONE) {
      if (flush === Z_PARTIAL_FLUSH) {
        trees._tr_align(s);
      }
      else if (flush !== Z_BLOCK) { /* FULL_FLUSH or SYNC_FLUSH */

        trees._tr_stored_block(s, 0, 0, false);
        /* For a full flush, this empty block will be recognized
         * as a special marker by inflate_sync().
         */
        if (flush === Z_FULL_FLUSH) {
          /*** CLEAR_HASH(s); ***/             /* forget history */
          zero(s.head); // Fill with NIL (= 0);

          if (s.lookahead === 0) {
            s.strstart = 0;
            s.block_start = 0;
            s.insert = 0;
          }
        }
      }
      flush_pending(strm);
      if (strm.avail_out === 0) {
        s.last_flush = -1; /* avoid BUF_ERROR at next call, see above */
        return Z_OK;
      }
    }
  }
  //Assert(strm->avail_out > 0, "bug2");
  //if (strm.avail_out <= 0) { throw new Error("bug2");}

  if (flush !== Z_FINISH) { return Z_OK; }
  if (s.wrap <= 0) { return Z_STREAM_END; }

  /* Write the trailer */
  if (s.wrap === 2) {
    put_byte(s, strm.adler & 0xff);
    put_byte(s, (strm.adler >> 8) & 0xff);
    put_byte(s, (strm.adler >> 16) & 0xff);
    put_byte(s, (strm.adler >> 24) & 0xff);
    put_byte(s, strm.total_in & 0xff);
    put_byte(s, (strm.total_in >> 8) & 0xff);
    put_byte(s, (strm.total_in >> 16) & 0xff);
    put_byte(s, (strm.total_in >> 24) & 0xff);
  }
  else
  {
    putShortMSB(s, strm.adler >>> 16);
    putShortMSB(s, strm.adler & 0xffff);
  }

  flush_pending(strm);
  /* If avail_out is zero, the application will call deflate again
   * to flush the rest.
   */
  if (s.wrap > 0) { s.wrap = -s.wrap; }
  /* write the trailer only once! */
  return s.pending !== 0 ? Z_OK : Z_STREAM_END;
}

function deflateEnd(strm) {
  var status;

  if (!strm/*== Z_NULL*/ || !strm.state/*== Z_NULL*/) {
    return Z_STREAM_ERROR;
  }

  status = strm.state.status;
  if (status !== INIT_STATE &&
    status !== EXTRA_STATE &&
    status !== NAME_STATE &&
    status !== COMMENT_STATE &&
    status !== HCRC_STATE &&
    status !== BUSY_STATE &&
    status !== FINISH_STATE
  ) {
    return err(strm, Z_STREAM_ERROR);
  }

  strm.state = null;

  return status === BUSY_STATE ? err(strm, Z_DATA_ERROR) : Z_OK;
}


/* =========================================================================
 * Initializes the compression dictionary from the given byte
 * sequence without producing any compressed output.
 */
function deflateSetDictionary(strm, dictionary) {
  var dictLength = dictionary.length;

  var s;
  var str, n;
  var wrap;
  var avail;
  var next;
  var input;
  var tmpDict;

  if (!strm/*== Z_NULL*/ || !strm.state/*== Z_NULL*/) {
    return Z_STREAM_ERROR;
  }

  s = strm.state;
  wrap = s.wrap;

  if (wrap === 2 || (wrap === 1 && s.status !== INIT_STATE) || s.lookahead) {
    return Z_STREAM_ERROR;
  }

  /* when using zlib wrappers, compute Adler-32 for provided dictionary */
  if (wrap === 1) {
    /* adler32(strm->adler, dictionary, dictLength); */
    strm.adler = adler32(strm.adler, dictionary, dictLength, 0);
  }

  s.wrap = 0;   /* avoid computing Adler-32 in read_buf */

  /* if dictionary would fill window, just replace the history */
  if (dictLength >= s.w_size) {
    if (wrap === 0) {            /* already empty otherwise */
      /*** CLEAR_HASH(s); ***/
      zero(s.head); // Fill with NIL (= 0);
      s.strstart = 0;
      s.block_start = 0;
      s.insert = 0;
    }
    /* use the tail */
    // dictionary = dictionary.slice(dictLength - s.w_size);
    tmpDict = new utils.Buf8(s.w_size);
    utils.arraySet(tmpDict, dictionary, dictLength - s.w_size, s.w_size, 0);
    dictionary = tmpDict;
    dictLength = s.w_size;
  }
  /* insert dictionary into window and hash */
  avail = strm.avail_in;
  next = strm.next_in;
  input = strm.input;
  strm.avail_in = dictLength;
  strm.next_in = 0;
  strm.input = dictionary;
  fill_window(s);
  while (s.lookahead >= MIN_MATCH) {
    str = s.strstart;
    n = s.lookahead - (MIN_MATCH - 1);
    do {
      /* UPDATE_HASH(s, s->ins_h, s->window[str + MIN_MATCH-1]); */
      s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[str + MIN_MATCH - 1]) & s.hash_mask;

      s.prev[str & s.w_mask] = s.head[s.ins_h];

      s.head[s.ins_h] = str;
      str++;
    } while (--n);
    s.strstart = str;
    s.lookahead = MIN_MATCH - 1;
    fill_window(s);
  }
  s.strstart += s.lookahead;
  s.block_start = s.strstart;
  s.insert = s.lookahead;
  s.lookahead = 0;
  s.match_length = s.prev_length = MIN_MATCH - 1;
  s.match_available = 0;
  strm.next_in = next;
  strm.input = input;
  strm.avail_in = avail;
  s.wrap = wrap;
  return Z_OK;
}


exports.deflateInit = deflateInit;
exports.deflateInit2 = deflateInit2;
exports.deflateReset = deflateReset;
exports.deflateResetKeep = deflateResetKeep;
exports.deflateSetHeader = deflateSetHeader;
exports.deflate = deflate;
exports.deflateEnd = deflateEnd;
exports.deflateSetDictionary = deflateSetDictionary;
exports.deflateInfo = 'pako deflate (from Nodeca project)';

/* Not implemented
exports.deflateBound = deflateBound;
exports.deflateCopy = deflateCopy;
exports.deflateParams = deflateParams;
exports.deflatePending = deflatePending;
exports.deflatePrime = deflatePrime;
exports.deflateTune = deflateTune;
*/


/***/ }),

/***/ "a605":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function matrix2path(matrix) {
    var N = matrix.length;
    var filled = [];
    for (var row = -1; row <= N; row++) {
        filled[row] = [];
    }

    var path = [];
    for (var row = 0; row < N; row++) {
        for (var col = 0; col < N; col++) {
            if (filled[row][col]) continue;
            filled[row][col] = 1;
            if (isDark(row, col)) {
                if (!isDark(row - 1, col)) {
                    path.push(plot(row, col, 'right'));
                }
            } else {
                if (isDark(row, col - 1)) {
                    path.push(plot(row, col, 'down'));
                }
            }
        }
    }
    return path;

    function isDark(row, col) {
        if (row < 0 || col < 0 || row >= N || col >= N) return false;
        return !!matrix[row][col];
    }

    function plot(row0, col0, dir) {
        filled[row0][col0] = 1;
        var res = [];
        res.push(['M',  col0, row0 ]);
        var row = row0;
        var col = col0;
        var len = 0;
        do {
            switch (dir) {
            case 'right':
                filled[row][col] = 1;
                if (isDark(row, col)) {
                    filled[row - 1][col] = 1;
                    if (isDark(row - 1, col)) {
                        res.push(['h', len]);
                        len = 0;
                        dir = 'up';
                    } else {
                        len++;
                        col++;
                    }
                } else {
                    res.push(['h', len]);
                    len = 0;
                    dir = 'down';
                }
                break;
            case 'left':
                filled[row - 1][col - 1] = 1;
                if (isDark(row - 1, col - 1)) {
                    filled[row][col - 1] = 1;
                    if (isDark(row, col - 1)) {
                        res.push(['h', -len]);
                        len = 0;
                        dir = 'down';
                    } else {
                        len++;
                        col--;
                    }
                } else {
                    res.push(['h', -len]);
                    len = 0;
                    dir = 'up';
                }
                break;
            case 'down':
                filled[row][col - 1] = 1;
                if (isDark(row, col - 1)) {
                    filled[row][col] = 1;
                    if (isDark(row, col)) {
                        res.push(['v', len]);
                        len = 0;
                        dir = 'right';
                    } else {
                        len++;
                        row++;
                    }
                } else {
                    res.push(['v', len]);
                    len = 0;
                    dir = 'left';
                }
                break;
            case 'up':
                filled[row - 1][col] = 1;
                if (isDark(row - 1, col)) {
                    filled[row - 1][col - 1] = 1;
                    if (isDark(row - 1, col - 1)) {
                        res.push(['v', -len]);
                        len = 0;
                        dir = 'left';
                    } else {
                        len++;
                        row--;
                    }
                } else {
                    res.push(['v', -len]);
                    len = 0;
                    dir = 'right';
                }
                break;
            }
        } while (row != row0 || col != col0);
        return res;
    }
}

function pushSVGPath(matrix, stream, margin) {
    matrix2path(matrix).forEach(function(subpath) {
        var res = '';
        for (var k = 0; k < subpath.length; k++) {
            var item = subpath[k];
            switch (item[0]) {
            case 'M':
                res += 'M' + (item[1] + margin) + ' ' + (item[2] + margin);
                break;
            default:
                res += item.join('');
            }
        }
        res += 'z';
        stream.push(res);
    });
}

function SVG_object(matrix, margin) {
    var stream = [];
    pushSVGPath(matrix, stream, margin);

    var result = {
        size: matrix.length + 2 * margin,
        path: stream.filter(Boolean).join('')
    }

    return result;
}

function SVG(matrix, stream, margin, size) {
    var X = matrix.length + 2 * margin;
    stream.push('<svg xmlns="http://www.w3.org/2000/svg" ');
    if (size > 0) {
        var XY = X * size;
        stream.push('width="' + XY + '" height="' + XY + '" ');
    }
    stream.push('viewBox="0 0 ' + X + ' ' + X + '">');
    stream.push('<path d="');
    pushSVGPath(matrix, stream, margin);
    stream.push('"/></svg>');
    stream.push(null);
}

function EPS(matrix, stream, margin) {
    var N = matrix.length;
    var scale = 9;
    var X = (N + 2 * margin) * scale;
    stream.push([
        '%!PS-Adobe-3.0 EPSF-3.0',
        '%%BoundingBox: 0 0 ' + X + ' ' + X,
        '/h { 0 rlineto } bind def',
        '/v { 0 exch neg rlineto } bind def',
        '/M { neg ' + (N + margin) + ' add moveto } bind def',
        '/z { closepath } bind def',
        scale + ' ' + scale + ' scale',
        ''
    ].join('\n'));

    matrix2path(matrix).forEach(function(subpath) {
        var res = '';
        for (var k = 0; k < subpath.length; k++) {
            var item = subpath[k];
            switch (item[0]) {
            case 'M':
                res += (item[1] + margin) + ' ' + item[2] + ' M ';
                break;
            default:
                res += item[1] + ' ' + item[0] + ' ';
            }
        }
        res += 'z\n';
        stream.push(res);
    });

    stream.push('fill\n%%EOF\n');
    stream.push(null);
}

function PDF(matrix, stream, margin) {
    // TODO deflate
    var N = matrix.length;
    var scale = 9;
    var X = (N + 2 * margin) * scale;
    var data = [
        '%PDF-1.0\n\n',
        '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n',
        '2 0 obj << /Type /Pages /Count 1 /Kids [ 3 0 R ] >> endobj\n',
    ];
    data.push('3 0 obj << /Type /Page /Parent 2 0 R /Resources <<>> ' +
        '/Contents 4 0 R /MediaBox [ 0 0 ' + X + ' ' + X + ' ] >> endobj\n');

    var path = scale + ' 0 0 ' + scale + ' 0 0 cm\n';
    path += matrix2path(matrix).map(function(subpath) {
        var res = '';
        var x, y;
        for (var k = 0; k < subpath.length; k++) {
            var item = subpath[k];
            switch (item[0]) {
            case 'M':
                x = item[1] + margin;
                y = N - item[2] + margin;
                res += x + ' ' + y + ' m ';
                break;
            case 'h':
                x += item[1];
                res += x + ' ' + y + ' l ';
                break;
            case 'v':
                y -= item[1];
                res += x + ' ' + y + ' l ';
                break;
            }
        }
        res += 'h';
        return res;
    }).join('\n');
    path += '\nf\n';
    data.push('4 0 obj << /Length ' + path.length + ' >> stream\n' +
        path + 'endstream\nendobj\n');

    var xref = 'xref\n0 5\n0000000000 65535 f \n';
    for (var i = 1, l = data[0].length; i < 5; i++) {
        xref += ('0000000000' + l).substr(-10) + ' 00000 n \n';
        l += data[i].length;
    }
    data.push(
        xref,
        'trailer << /Root 1 0 R /Size 5 >>\n',
        'startxref\n' + l + '\n%%EOF\n'
    );
    stream.push(data.join(''));
    stream.push(null);
}

module.exports = {
    svg: SVG,
    eps: EPS,
    pdf: PDF,
    svg_object: SVG_object
}


/***/ }),

/***/ "be7f":
/***/ (function(module, exports, __webpack_require__) {

"use strict";



var TYPED_OK =  (typeof Uint8Array !== 'undefined') &&
                (typeof Uint16Array !== 'undefined') &&
                (typeof Int32Array !== 'undefined');

function _has(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

exports.assign = function (obj /*from1, from2, from3, ...*/) {
  var sources = Array.prototype.slice.call(arguments, 1);
  while (sources.length) {
    var source = sources.shift();
    if (!source) { continue; }

    if (typeof source !== 'object') {
      throw new TypeError(source + 'must be non-object');
    }

    for (var p in source) {
      if (_has(source, p)) {
        obj[p] = source[p];
      }
    }
  }

  return obj;
};


// reduce buffer size, avoiding mem copy
exports.shrinkBuf = function (buf, size) {
  if (buf.length === size) { return buf; }
  if (buf.subarray) { return buf.subarray(0, size); }
  buf.length = size;
  return buf;
};


var fnTyped = {
  arraySet: function (dest, src, src_offs, len, dest_offs) {
    if (src.subarray && dest.subarray) {
      dest.set(src.subarray(src_offs, src_offs + len), dest_offs);
      return;
    }
    // Fallback to ordinary array
    for (var i = 0; i < len; i++) {
      dest[dest_offs + i] = src[src_offs + i];
    }
  },
  // Join array of chunks to single array.
  flattenChunks: function (chunks) {
    var i, l, len, pos, chunk, result;

    // calculate data length
    len = 0;
    for (i = 0, l = chunks.length; i < l; i++) {
      len += chunks[i].length;
    }

    // join chunks
    result = new Uint8Array(len);
    pos = 0;
    for (i = 0, l = chunks.length; i < l; i++) {
      chunk = chunks[i];
      result.set(chunk, pos);
      pos += chunk.length;
    }

    return result;
  }
};

var fnUntyped = {
  arraySet: function (dest, src, src_offs, len, dest_offs) {
    for (var i = 0; i < len; i++) {
      dest[dest_offs + i] = src[src_offs + i];
    }
  },
  // Join array of chunks to single array.
  flattenChunks: function (chunks) {
    return [].concat.apply([], chunks);
  }
};


// Enable/Disable typed arrays use, for testing
//
exports.setTyped = function (on) {
  if (on) {
    exports.Buf8  = Uint8Array;
    exports.Buf16 = Uint16Array;
    exports.Buf32 = Int32Array;
    exports.assign(exports, fnTyped);
  } else {
    exports.Buf8  = Array;
    exports.Buf16 = Array;
    exports.Buf32 = Array;
    exports.assign(exports, fnUntyped);
  }
};

exports.setTyped(TYPED_OK);


/***/ }),

/***/ "c834":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// Note: adler32 takes 12% for level 0 and 2% for level 6.
// It isn't worth it to make additional optimizations as in original.
// Small size is preferable.

// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

function adler32(adler, buf, len, pos) {
  var s1 = (adler & 0xffff) |0,
      s2 = ((adler >>> 16) & 0xffff) |0,
      n = 0;

  while (len !== 0) {
    // Set limit ~ twice less than 5552, to keep
    // s2 in 31-bits, because we force signed ints.
    // in other case %= will fail.
    n = len > 2000 ? 2000 : len;
    len -= n;

    do {
      s1 = (s1 + buf[pos++]) |0;
      s2 = (s2 + s1) |0;
    } while (--n);

    s1 %= 65521;
    s2 %= 65521;
  }

  return (s1 | (s2 << 16)) |0;
}


module.exports = adler32;


/***/ }),

/***/ "cae6":
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(Buffer) {

// {{{1 Galois Field Math
var GF256_BASE = 285;

var EXP_TABLE = [1];
var LOG_TABLE = [];

for (var i = 1; i < 256; i++) {
    var n = EXP_TABLE[i - 1] << 1;
    if (n > 255) n = n ^ GF256_BASE;
    EXP_TABLE[i] = n;
}

for (var i = 0; i < 255; i++) {
    LOG_TABLE[EXP_TABLE[i]] = i;
}

function exp(k) {
    while (k < 0) k += 255;
    while (k > 255) k -= 255;
    return EXP_TABLE[k];
}

function log(k) {
    if (k < 1 || k > 255) {
        throw Error('Bad log(' + k + ')');
    }
    return LOG_TABLE[k];
}

// {{{1 Generator Polynomials
var POLYNOMIALS = [
    [0], // a^0 x^0
    [0, 0], // a^0 x^1 + a^0 x^0
    [0, 25, 1], // a^0 x^2 + a^25 x^1 + a^1 x^0
    // and so on...
];

function generatorPolynomial(num) {
    if (POLYNOMIALS[num]) {
        return POLYNOMIALS[num];
    }
    var prev = generatorPolynomial(num - 1);
    var res = [];

    res[0] = prev[0];
    for (var i = 1; i <= num; i++) {
        res[i] = log(exp(prev[i]) ^ exp(prev[i - 1] + num - 1));
    }
    POLYNOMIALS[num] = res;
    return res;
}

// {{{1 export functions
module.exports = function calculate_ec(msg, ec_len) {
    // `msg` could be array or buffer
    // convert `msg` to array
    msg = [].slice.call(msg);

    // Generator Polynomial
    var poly = generatorPolynomial(ec_len);

    for (var i = 0; i < ec_len; i++) msg.push(0);
    while (msg.length > ec_len) {
        if (!msg[0]) {
            msg.shift();
            continue;
        }
        var log_k = log(msg[0]);
        for (var i = 0; i <= ec_len; i++) {
            msg[i] = msg[i] ^ exp(poly[i] + log_k);
        }
        msg.shift();
    }
    return new Buffer(msg);
}

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__("b639").Buffer))

/***/ }),

/***/ "cf62":
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(Buffer) {

var encode = __webpack_require__("ef95");
var calculateEC = __webpack_require__("cae6");
var matrix = __webpack_require__("90b5");

function _deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
}

var EC_LEVELS = ['L', 'M', 'Q', 'H'];

// {{{1 Versions
var versions = [
    [], // there is no version 0
    // total number of codewords, (number of ec codewords, number of blocks) * ( L, M, Q, H )
    [26, 7, 1, 10, 1, 13, 1, 17, 1],
    [44, 10, 1, 16, 1, 22, 1, 28, 1],
    [70, 15, 1, 26, 1, 36, 2, 44, 2],
    [100, 20, 1, 36, 2, 52, 2, 64, 4],
    [134, 26, 1, 48, 2, 72, 4, 88, 4], // 5
    [172, 36, 2, 64, 4, 96, 4, 112, 4],
    [196, 40, 2, 72, 4, 108, 6, 130, 5],
    [242, 48, 2, 88, 4, 132, 6, 156, 6],
    [292, 60, 2, 110, 5, 160, 8, 192, 8],
    [346, 72, 4, 130, 5, 192, 8, 224, 8], // 10
    [404, 80, 4, 150, 5, 224, 8, 264, 11],
    [466, 96, 4, 176, 8, 260, 10, 308, 11],
    [532, 104, 4, 198, 9, 288, 12, 352, 16],
    [581, 120, 4, 216, 9, 320, 16, 384, 16],
    [655, 132, 6, 240, 10, 360, 12, 432, 18], // 15
    [733, 144, 6, 280, 10, 408, 17, 480, 16],
    [815, 168, 6, 308, 11, 448, 16, 532, 19],
    [901, 180, 6, 338, 13, 504, 18, 588, 21],
    [991, 196, 7, 364, 14, 546, 21, 650, 25],
    [1085, 224, 8, 416, 16, 600, 20, 700, 25], // 20
    [1156, 224, 8, 442, 17, 644, 23, 750, 25],
    [1258, 252, 9, 476, 17, 690, 23, 816, 34],
    [1364, 270, 9, 504, 18, 750, 25, 900, 30],
    [1474, 300, 10, 560, 20, 810, 27, 960, 32],
    [1588, 312, 12, 588, 21, 870, 29, 1050, 35], // 25
    [1706, 336, 12, 644, 23, 952, 34, 1110, 37],
    [1828, 360, 12, 700, 25, 1020, 34, 1200, 40],
    [1921, 390, 13, 728, 26, 1050, 35, 1260, 42],
    [2051, 420, 14, 784, 28, 1140, 38, 1350, 45],
    [2185, 450, 15, 812, 29, 1200, 40, 1440, 48], // 30
    [2323, 480, 16, 868, 31, 1290, 43, 1530, 51],
    [2465, 510, 17, 924, 33, 1350, 45, 1620, 54],
    [2611, 540, 18, 980, 35, 1440, 48, 1710, 57],
    [2761, 570, 19, 1036, 37, 1530, 51, 1800, 60],
    [2876, 570, 19, 1064, 38, 1590, 53, 1890, 63], // 35
    [3034, 600, 20, 1120, 40, 1680, 56, 1980, 66],
    [3196, 630, 21, 1204, 43, 1770, 59, 2100, 70],
    [3362, 660, 22, 1260, 45, 1860, 62, 2220, 74],
    [3532, 720, 24, 1316, 47, 1950, 65, 2310, 77],
    [3706, 750, 25, 1372, 49, 2040, 68, 2430, 81] // 40
];

versions = versions.map(function(v, index) {
    if (!index) return {};

    var res = {
    }
    for (var i = 1; i < 8; i += 2) {
        var length = v[0] - v[i];
        var num_template = v[i+1];
        var ec_level = EC_LEVELS[(i/2)|0];
        var level = {
            version: index,
            ec_level: ec_level,
            data_len: length,
            ec_len: v[i] / num_template,
            blocks: [],
            ec: []
        }

        for (var k = num_template, n = length; k > 0; k--) {
            var block = (n / k)|0;
            level.blocks.push(block);
            n -= block;

        }
        res[ec_level] = level;
    }
    return res;
});

// {{{1 Get version template
function getTemplate(message, ec_level) {
    var i = 1;
    var len;

    if (message.data1) {
        len = Math.ceil(message.data1.length / 8);
    } else {
        i = 10;
    }
    for (/* i */; i < 10; i++) {
        var version = versions[i][ec_level];
        if (version.data_len >= len) {
            return _deepCopy(version);
        }
    }

    if (message.data10) {
        len = Math.ceil(message.data10.length / 8);
    } else {
        i = 27;
    }
    for (/* i */; i < 27; i++) {
        var version = versions[i][ec_level];
        if (version.data_len >= len) {
            return _deepCopy(version);
        }
    }

    len = Math.ceil(message.data27.length / 8);
    for (/* i */; i < 41; i++) {
        var version = versions[i][ec_level];
        if (version.data_len >= len) {
            return _deepCopy(version);
        }
    }
    throw new Error("Too much data");
}

// {{{1 Fill template
function fillTemplate(message, template) {
    var blocks = new Buffer(template.data_len);
    blocks.fill(0);

    if (template.version < 10) {
        message = message.data1;
    } else if (template.version < 27) {
        message = message.data10;
    } else {
        message = message.data27;
    }

    var len = message.length;

    for (var i = 0; i < len; i += 8) {
        var b = 0;
        for (var j = 0; j < 8; j++) {
            b = (b << 1) | (message[i + j] ? 1 : 0);
        }
        blocks[i / 8] = b;
    }

    var pad = 236;
    for (var i = Math.ceil((len + 4) / 8); i < blocks.length; i++) {
        blocks[i] = pad;
        pad = (pad == 236) ? 17 : 236;
    }

    var offset = 0;
    template.blocks = template.blocks.map(function(n) {
        var b = blocks.slice(offset, offset + n);
        offset += n;
        template.ec.push(calculateEC(b, template.ec_len));
        return b;
    });

    return template;
}

// {{{1 All-in-one
function QR(text, ec_level, parse_url) {
    ec_level = EC_LEVELS.indexOf(ec_level) > -1 ? ec_level : 'M';
    var message = encode(text, parse_url);
    var data = fillTemplate(message, getTemplate(message, ec_level));
    return matrix.getMatrix(data);
}

// {{{1 export functions
module.exports = {
    QR: QR,
    getTemplate: getTemplate,
    fillTemplate: fillTemplate,
}

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__("b639").Buffer))

/***/ }),

/***/ "de6e":
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(Buffer) {

var crc_table = [];

for (var n = 0; n < 256; n++) {
    var c = crc_table[n] = new Buffer(4);
    c.writeUInt32BE(n, 0);

    for (var k = 0; k < 8; k++) {
        var b0 = c[0] & 1;
        var b1 = c[1] & 1;
        var b2 = c[2] & 1;
        var b3 = c[3] & 1;

        c[0] = (c[0] >> 1) ^ (b3 ? 0xed : 0);
        c[1] = (c[1] >> 1) ^ (b3 ? 0xb8 : 0) ^ (b0 ? 0x80 : 0);
        c[2] = (c[2] >> 1) ^ (b3 ? 0x83 : 0) ^ (b1 ? 0x80 : 0);
        c[3] = (c[3] >> 1) ^ (b3 ? 0x20 : 0) ^ (b2 ? 0x80 : 0);
    }
}

function update(c, buf) {
    var l = buf.length;
    for (var n = 0; n < l; n++) {
        var e = crc_table[c[3] ^ buf[n]];
        c[3] = e[3] ^ c[2];
        c[2] = e[2] ^ c[1];
        c[1] = e[1] ^ c[0];
        c[0] = e[0];
    }
}

function crc32(/* arguments */) {
    var l = arguments.length;
    var c = new Buffer(4);
    c.fill(0xff);

    for (var i = 0; i < l; i++) {
        update(c, new Buffer(arguments[i]));
    }

    c[0] = c[0] ^ 0xff;
    c[1] = c[1] ^ 0xff;
    c[2] = c[2] ^ 0xff;
    c[3] = c[3] ^ 0xff;

    return c.readUInt32BE(0);
}

module.exports = crc32;

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__("b639").Buffer))

/***/ }),

/***/ "eeda":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// Note: we can't get significant speed boost here.
// So write code to minimize size - no pregenerated tables
// and array tools dependencies.

// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

// Use ordinary array, since untyped makes no boost here
function makeTable() {
  var c, table = [];

  for (var n = 0; n < 256; n++) {
    c = n;
    for (var k = 0; k < 8; k++) {
      c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
    }
    table[n] = c;
  }

  return table;
}

// Create table on load. Just 255 signed longs. Not a problem.
var crcTable = makeTable();


function crc32(crc, buf, len, pos) {
  var t = crcTable,
      end = pos + len;

  crc ^= -1;

  for (var i = pos; i < end; i++) {
    crc = (crc >>> 8) ^ t[(crc ^ buf[i]) & 0xFF];
  }

  return (crc ^ (-1)); // >>> 0;
}


module.exports = crc32;


/***/ }),

/***/ "ef95":
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(Buffer) {

function pushBits(arr, n, value) {
    for (var bit = 1 << (n - 1); bit; bit = bit >>> 1) {
        arr.push(bit & value ? 1 : 0);
    }
}

// {{{1 8bit encode
function encode_8bit(data) {
    var len = data.length;
    var bits = [];

    for (var i = 0; i < len; i++) {
        pushBits(bits, 8, data[i]);
    }

    var res = {};

    var d = [0, 1, 0, 0];
    pushBits(d, 16, len);
    res.data10 = res.data27 = d.concat(bits);

    if (len < 256) {
        var d = [0, 1, 0, 0];
        pushBits(d, 8, len);
        res.data1 = d.concat(bits);
    }

    return res;
}

// {{{1 alphanumeric encode
var ALPHANUM = (function(s) {
    var res = {};
    for (var i = 0; i < s.length; i++) {
        res[s[i]] = i;
    }
    return res;
})('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:');

function encode_alphanum(str) {
    var len = str.length;
    var bits = [];

    for (var i = 0; i < len; i += 2) {
        var b = 6;
        var n = ALPHANUM[str[i]];
        if (str[i+1]) {
            b = 11;
            n = n * 45 + ALPHANUM[str[i+1]];
        }
        pushBits(bits, b, n);
    }

    var res = {};

    var d = [0, 0, 1, 0];
    pushBits(d, 13, len);
    res.data27 = d.concat(bits);

    if (len < 2048) {
        var d = [0, 0, 1, 0];
        pushBits(d, 11, len);
        res.data10 = d.concat(bits);
    }

    if (len < 512) {
        var d = [0, 0, 1, 0];
        pushBits(d, 9, len);
        res.data1 = d.concat(bits);
    }

    return res;
}

// {{{1 numeric encode
function encode_numeric(str) {
    var len = str.length;
    var bits = [];

    for (var i = 0; i < len; i += 3) {
        var s = str.substr(i, 3);
        var b = Math.ceil(s.length * 10 / 3);
        pushBits(bits, b, parseInt(s, 10));
    }

    var res = {};

    var d = [0, 0, 0, 1];
    pushBits(d, 14, len);
    res.data27 = d.concat(bits);

    if (len < 4096) {
        var d = [0, 0, 0, 1];
        pushBits(d, 12, len);
        res.data10 = d.concat(bits);
    }

    if (len < 1024) {
        var d = [0, 0, 0, 1];
        pushBits(d, 10, len);
        res.data1 = d.concat(bits);
    }

    return res;
}

// {{{1 url encode
function encode_url(str) {
    var slash = str.indexOf('/', 8) + 1 || str.length;
    var res = encode(str.slice(0, slash).toUpperCase(), false);

    if (slash >= str.length) {
        return res;
    }

    var path_res = encode(str.slice(slash), false);

    res.data27 = res.data27.concat(path_res.data27);

    if (res.data10 && path_res.data10) {
        res.data10 = res.data10.concat(path_res.data10);
    }

    if (res.data1 && path_res.data1) {
        res.data1 = res.data1.concat(path_res.data1);
    }

    return res;
}

// {{{1 Choose encode mode and generates struct with data for different version
function encode(data, parse_url) {
    var str;
    var t = typeof data;

    if (t == 'string' || t == 'number') {
        str = '' + data;
        data = new Buffer(str);
    } else if (Buffer.isBuffer(data)) {
        str = data.toString();
    } else if (Array.isArray(data)) {
        data = new Buffer(data);
        str = data.toString();
    } else {
        throw new Error("Bad data");
    }

    if (/^[0-9]+$/.test(str)) {
        if (data.length > 7089) {
            throw new Error("Too much data");
        }
        return encode_numeric(str);
    }

    if (/^[0-9A-Z \$%\*\+\.\/\:\-]+$/.test(str)) {
        if (data.length > 4296) {
            throw new Error("Too much data");
        }
        return encode_alphanum(str);
    }

    if (parse_url && /^https?:/i.test(str)) {
        return encode_url(str);
    }

    if (data.length > 2953) {
        throw new Error("Too much data");
    }
    return encode_8bit(data);
}

// {{{1 export functions
module.exports = encode;

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__("b639").Buffer))

/***/ })

}]);