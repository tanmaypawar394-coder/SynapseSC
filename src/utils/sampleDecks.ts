/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FlashcardDeck } from '../types/flashcard';

export interface SampleNotePreset {
  id: string;
  name: string;
  course: string;
  description: string;
  rawNotes: string;
  initialDeck: FlashcardDeck;
}

export const SAMPLE_PRESETS: SampleNotePreset[] = [
  {
    id: 'dist-sys',
    name: 'Distributed Systems: Raft, Paxos & Fault Tolerance',
    course: 'CS 624 - Distributed Computing Systems',
    description: 'Consensus protocols, Byzantine quorums, Vector Clocks, and Leader Election state machines.',
    rawNotes: `Lec 14: Consensus in Asynchronous Systems with Crash-Failures
Prof. Vaswani - Fall Semester

Key Papers: Ongaro & Ousterhout (Raft), Lamport (Paxos Made Simple), Castro & Liskov (PBFT)

1. FLP Impossibility Result (Fischer, Lynch, Paterson 1985):
- In an asynchronous network model, NO deterministic consensus protocol can guarantee both safety AND liveness in the presence of even a SINGLE unannounced crash failure.
- Practical mitigation: Partially synchronous models with randomized timeouts (e.g., Raft randomized timer 150-300ms to break election ties).

2. Raft Consensus Protocol Mechanics:
- 3 Roles: Follower, Candidate, Leader.
- State per node: currentTerm, votedFor, log[]: (term, index, command).
- Volatile state on leaders: nextIndex[] (initialized to leader's last log index + 1), matchIndex[] (initialized to 0).
- Election Safety Property: At most one leader can be elected in a given term.
- Leader Append-Only: Leader never overwrites or truncates its own log; only appends new entries.
- Log Matching Property:
  * If two logs contain an entry with the same index and term, then they store the same command.
  * If two logs contain an entry with the same index and term, then the logs are identical in all entries up through the given index.
- Leader Completeness Invariant:
  * If a log entry is committed in a given term, that entry will be present in the logs of the leaders for all higher-numbered terms.
  * Enforced by RequestVote RPC rule: Candidate includes lastLogIndex & lastLogTerm. Follower denies vote if candidate's log is less up-to-date:
    (c.lastLogTerm > f.lastLogTerm) || (c.lastLogTerm == f.lastLogTerm && c.lastLogIndex >= f.lastLogIndex).

3. Byzantine Fault Tolerance (PBFT - Practical BFT):
- Model: Up to f nodes can be arbitrary/malicious (Byzantine). Total nodes required: N >= 3f + 1.
- Why 3f + 1? If f nodes crash and f nodes are Byzantine and lie, non-faulty nodes must still form a strict majority of the remaining (N - f) responsive nodes:
  (N - f) - f > f  =>  N - 2f > f  =>  N >= 3f + 1.
- Phases: Pre-prepare -> Prepare (wait for 2f matching PREPARE messages) -> Commit (wait for 2f + 1 COMMIT messages) -> Reply to client.

4. Vector Clocks vs Lamport Timestamps:
- Lamport clocks: scalar counter L(e). If e -> e', then L(e) < L(e'). Converse DOES NOT hold (cannot detect concurrent events).
- Vector Clocks: V_i[j] = number of events at node j causally known to node i.
- Partial order: V <= V' iff for all k, V[k] <= V'[k].
- Concurrent check: e || e' iff !(V(e) <= V(e')) and !(V(e') <= V(e)).`,
    initialDeck: {
      id: 'deck-dist-sys',
      title: 'Distributed Systems: Raft, Paxos & Byzantine Fault Tolerance',
      courseSubject: 'CS 624 - Distributed Computing',
      tags: ['Distributed Systems', 'Algorithms', 'Operating Systems', 'Fault Tolerance'],
      createdAt: Date.now() - 86400000 * 2,
      cards: [
        {
          id: 'card-ds-1',
          category: 'Algorithm',
          subtopic: 'Consensus Limits',
          difficulty: 'Mastery',
          front: {
            title: 'FLP Impossibility Result & Mitigation',
            prompt: 'State the formal FLP Impossibility Theorem (1985). How do production consensus systems (e.g., Raft, Paxos) circumvent this theoretical bound in practice?',
            questionType: 'tradeoff',
          },
          back: {
            summary: 'Deterministic consensus cannot guarantee both safety and liveness in asynchronous networks with even one crash failure; practical systems sacrifice pure liveness during network partitions or rely on partial synchrony and randomized timers.',
            explanation: 'Fischer, Lynch, and Paterson proved that in an asynchronous model where message delay is unbounded, no deterministic consensus protocol can guarantee termination (liveness) if 1 node may crash. Raft and Paxos ensure strict Safety under all conditions, but only guarantee Liveness once the network exhibits partial synchrony (bounded delay delta) using randomized election timeouts (150-300ms) to avoid split votes.',
            complexity: {
              time: 'Safety: 100% invariant; Liveness: Probabilistic under partition',
              space: 'O(log entries) on disk',
            },
            examKeyPoints: [
              'Asynchronous model assumption is the key caveat of FLP',
              'Raft never sacrifices Safety: uncommitted logs are never exposed to clients',
              'Randomized timeouts break election symmetry in O(1) rounds with high probability',
            ],
            furtherContext: 'Exam trick: FLP does not mean consensus is impossible in real life; it proves unbounded worst-case termination without timing assumptions.',
          },
          box: 3,
          repetitions: 3,
          intervalDays: 5,
          lastReviewed: Date.now() - 86400000,
        },
        {
          id: 'card-ds-2',
          category: 'System Design',
          subtopic: 'Raft Log Matching',
          difficulty: 'Advanced',
          front: {
            title: 'Raft Election Restriction & Leader Completeness',
            prompt: 'In Raft, how does a follower decide whether to cast its vote in RequestVoteArgs? Write the condition and explain how it enforces the Leader Completeness Invariant.',
            codeSnippet: `// Candidate sending RequestVote RPC
type RequestVoteArgs struct {
    Term         int
    CandidateId  int
    LastLogIndex int
    LastLogTerm  int
}`,
            codeLanguage: 'go',
            questionType: 'invariant',
          },
          back: {
            summary: 'A voter denies its vote if the candidate\'s log is less up-to-date than its own, guaranteeing that any elected leader contains all committed entries from prior terms.',
            explanation: 'The voter compares (Candidate.LastLogTerm, Candidate.LastLogIndex) against its own (Voter.LastLogTerm, Voter.LastLogIndex). The candidate is at least as up-to-date iff: (c.LastLogTerm > v.LastLogTerm) || (c.LastLogTerm == v.LastLogTerm && c.LastLogIndex >= v.LastLogIndex). Because a committed entry must reside on a strict majority of nodes, and an elected leader must collect votes from a strict majority, their intersection contains at least one node with the committed entry, which will deny its vote to any candidate missing that entry.',
            codeSolutionOrOutput: `func (rf *Raft) RequestVote(args *RequestVoteArgs, reply *RequestVoteReply) {
    // Rule: deny if candidate log is less up-to-date
    lastTerm := rf.log[len(rf.log)-1].Term
    lastIndex := len(rf.log) - 1
    
    logOk := (args.LastLogTerm > lastTerm) || 
             (args.LastLogTerm == lastTerm && args.LastLogIndex >= lastIndex)
    if args.Term == rf.currentTerm && rf.votedFor == args.CandidateId && logOk {
        reply.VoteGranted = true
    }
}`,
            complexity: {
              time: 'O(1) log tail check',
              space: 'O(1)',
            },
            examKeyPoints: [
              'Term comparison takes strict precedence over log index length',
              'Majority quorum intersection guarantees at least one witness node',
              'Leaders never overwrite their own logs (Append-Only invariant)',
            ],
          },
          box: 2,
          repetitions: 2,
          intervalDays: 3,
          lastReviewed: Date.now() - 86400000 * 2,
        },
        {
          id: 'card-ds-3',
          category: 'Theory & Proof',
          subtopic: 'PBFT Quorums',
          difficulty: 'Mastery',
          front: {
            title: 'Byzantine Fault Tolerance: Why 3f + 1 Nodes?',
            prompt: 'Prove rigorously why a Byzantine Fault Tolerant system requires a total of N >= 3f + 1 replicas to tolerate f arbitrary/Byzantine failures.',
            questionType: 'tradeoff',
          },
          back: {
            summary: 'To guarantee progress after f unresponsive nodes, the system must proceed with N - f replies; among those, f could be Byzantine liars, requiring (N - f) - f > f honest nodes, yielding N >= 3f + 1.',
            explanation: '1. Liveness: If f nodes crash or refuse to respond, the protocol must make progress after receiving N - f responses.\n2. Safety: Among those N - f responses, up to f nodes could be Byzantine traitors sending coordinated misinformation. Therefore, the number of non-faulty, honest nodes in that responding subset is at least (N - f) - f = N - 2f.\n3. Majority condition: For the honest nodes to strictly outvote the f Byzantine nodes in any decision quorum: N - 2f > f => N > 3f => N >= 3f + 1.',
            complexity: {
              time: '3 communication phases (Pre-prepare, Prepare, Commit)',
              space: 'O(N^2) messages per consensus slot',
            },
            examKeyPoints: [
              'Crash fault tolerance requires 2f + 1; Byzantine requires 3f + 1',
              'Prepare phase requires 2f matching messages from distinct nodes',
              'Commit phase requires 2f + 1 commit messages before client reply',
            ],
          },
          box: 4,
          repetitions: 4,
          intervalDays: 9,
          lastReviewed: Date.now() - 86400000,
        },
        {
          id: 'card-ds-4',
          category: 'Concurrency',
          subtopic: 'Vector Clocks',
          difficulty: 'Advanced',
          front: {
            title: 'Causal Concurrency Detection via Vector Clocks',
            prompt: 'Given vector clocks V(a) = [2, 1, 3] and V(b) = [1, 3, 2], determine whether a -> b, b -> a, or a || b (concurrent). State the exact mathematical condition.',
            questionType: 'definition',
          },
          back: {
            summary: 'The events are concurrent (a || b) because neither vector clock is element-wise less than or equal to the other: V(a)[0] > V(b)[0] (2 > 1) but V(a)[1] < V(b)[1] (1 < 3).',
            explanation: 'In Vector Clocks, an event a causally precedes b (a -> b) iff: ∀k, V(a)[k] <= V(b)[k] AND ∃k, V(a)[k] < V(b)[k].\nHere:\nFor k=0: V(a)[0] = 2 > 1 = V(b)[0] => contradicts a -> b.\nFor k=1: V(a)[1] = 1 < 3 = V(b)[1] => contradicts b -> a.\nSince neither dominates element-wise across all dimensions, neither event happened before the other in causal history: a || b (concurrent).',
            complexity: {
              time: 'O(N) vector comparison where N = cluster size',
              space: 'O(N) integers per message header',
            },
            examKeyPoints: [
              'Lamport timestamps CANNOT detect concurrency (total order on partial reality)',
              'Vector clocks provide an exact isomorphism to distributed causal partial order',
              'Vector size scales with number of actors (mitigated via dotted version vectors)',
            ],
          },
          box: 1,
          repetitions: 0,
          intervalDays: 1,
          lastReviewed: undefined,
        },
      ],
    },
  },
  {
    id: 'arch-concurrency',
    name: 'Computer Architecture: MESI, False Sharing & TSO',
    course: 'CS 629 - Advanced Computer Architecture',
    description: 'Cache coherence protocols, hardware memory models, cache-line padding, and lock-free atomic sequences.',
    rawNotes: `Lec 9: Multiprocessor Memory Subsystems & Cache Coherence
Prof. H. Patterson

1. MESI Cache Coherence Protocol (Illinois Protocol):
- 4 States per 64-byte Cache Line:
  * Modified (M): Line valid in this cache only, dirty (different from main memory). Exclusive read/write.
  * Exclusive (E): Line valid in this cache only, clean (matches memory). Exclusive read/write.
  * Shared (S): Line may be present in multiple caches, clean. Read-only.
  * Invalid (I): Line is not valid.
- State Transitions & Bus Signals:
  * PrRd on Invalid -> issues BusRd. If other caches have it, transitions to Shared (S). If no other cache has it, transitions to Exclusive (E).
  * PrWr on Shared -> issues BusUpgr (invalidation signal to invalidate other caches without re-fetching data). Transitions to Modified (M).
  * PrWr on Invalid -> issues BusRdX (Read with Intent to Modify, brings data and invalidates all others). Transitions to Modified (M).
  * Remote BusRd when in M -> flush line to bus/memory, downgrade to Shared (S).

2. False Sharing Performance Pathology:
- Occurs when two threads on distinct CPU cores modify independent variables that reside within the SAME 64-byte hardware cache line.
- Hardware snooping causes continuous invalidation ping-pong between L1/L2 caches across interconnect, destroying multi-core scalability.
- Mitigation in C++: alignas(64) or std::hardware_destructive_interference_size.

3. Memory Consistency: Total Store Order (TSO) vs Sequential Consistency (SC):
- x86-64 provides TSO hardware memory model:
  * Stores are buffered in a FIFO Store Buffer per core (Store-Load reordering is ALLOWED!).
  * Load-Load, Store-Store, and Load-Store reorderings are FORBIDDEN in hardware.
  * Classic Dekker/Peterson test: Thread 1 does X = 1; r1 = Y. Thread 2 does Y = 1; r2 = X. Under TSO, outcome r1 == 0 && r2 == 0 is POSSIBLE!
  * Hardware fence required: MFENCE (or LOCK CMPXCHG) to flush the store buffer.`,
    initialDeck: {
      id: 'deck-arch-concurrency',
      title: 'Computer Architecture: MESI Coherence & TSO Memory Consistency',
      courseSubject: 'CS 629 - Advanced Architecture',
      tags: ['Operating Systems', 'Computer Architecture', 'Concurrency', 'Data Structures'],
      createdAt: Date.now() - 86400000 * 3,
      cards: [
        {
          id: 'card-arch-1',
          category: 'Architecture',
          subtopic: 'Cache Coherence',
          difficulty: 'Mastery',
          front: {
            title: 'BusUpgr vs BusRdX in MESI Protocol',
            prompt: 'In the MESI protocol, what is the precise operational difference between emitting a BusUpgr transaction versus a BusRdX transaction? When is each used?',
            questionType: 'definition',
          },
          back: {
            summary: 'BusRdX transfers both the data and invalidates other caches (used on Write Miss from Invalid state); BusUpgr only invalidates peer caches without transferring data payload (used on Write Hit from Shared state).',
            explanation: 'When a core executes a processor write (PrWr) on an Invalid line, it lacks the data; it must emit BusRdX (Read with Intent to Modify) to fetch the cache block from memory/peer AND invalidate other copies.\nIn contrast, if the core already holds the line in Shared (S) state, it already possesses valid, up-to-date data. Emitting a full BusRdX would waste memory bus bandwidth transferring 64 bytes. Instead, it emits BusUpgr, which only broadcasts invalidation address messages, saving memory bus bandwidth.',
            complexity: {
              time: 'BusUpgr saves ~64 bytes bus transfer latency vs BusRdX',
              space: '2 bits per cache block for state encoding',
            },
            examKeyPoints: [
              'BusUpgr carries NO data payload on the interconnect',
              'Transition from S -> M uses BusUpgr; I -> M uses BusRdX',
              'In MOESI, the Owner (O) state enables sharing dirty lines without memory writeback',
            ],
          },
          box: 3,
          repetitions: 3,
          intervalDays: 6,
          lastReviewed: Date.now() - 86400000,
        },
        {
          id: 'card-arch-2',
          category: 'Code Snippet',
          subtopic: 'False Sharing Elimination',
          difficulty: 'Intermediate',
          front: {
            title: 'Detecting and Eliminating False Sharing in Multi-Threaded Structs',
            prompt: 'Explain why the following C++ struct suffers from catastrophic cache thrashing on high-core CPUs, and rewrite it using modern C++17 memory alignment to fix the bug.',
            codeSnippet: `struct ThreadCounters {
    uint64_t core0_ops; // Thread 0 writes here
    uint64_t core1_ops; // Thread 1 writes here
};`,
            codeLanguage: 'cpp',
            questionType: 'code-analysis',
          },
          back: {
            summary: 'Both 8-byte uint64_t counters sit on the same 64-byte L1 cache line, causing constant invalidation ping-pong; fix by aligning each variable to hardware cache-line boundaries.',
            explanation: 'Modern x86-64 and ARM processors manage coherence at 64-byte granularity. Because sizeof(uint64_t) is 8 bytes, core0_ops and core1_ops occupy offsets 0 and 8 of the same line. Every write by Core 0 marks Core 1\'s L1 line as Invalid, forcing an interconnect snoop and stall.',
            codeSolutionOrOutput: `#include <new> // for hardware_destructive_interference_size

struct alignas(std::hardware_destructive_interference_size) ThreadCountersFixed {
    alignas(64) uint64_t core0_ops;
    alignas(64) uint64_t core1_ops;
};
// Or padding:
struct PaddedCounter {
    uint64_t val;
    char pad[56]; // 64 - 8 bytes padding
};`,
            complexity: {
              time: 'Reduces memory bus traffic from O(N_writes) to O(1)',
              space: 'Increases memory footprint by 56 bytes per counter',
            },
            examKeyPoints: [
              'False sharing does NOT violate program correctness, but annihilates performance',
              'Use std::hardware_destructive_interference_size (C++17) or alignas(64)',
              'Common in per-thread accumulators, ring buffer head/tail pointers',
            ],
          },
          box: 4,
          repetitions: 4,
          intervalDays: 12,
          lastReviewed: Date.now() - 86400000 * 2,
        },
        {
          id: 'card-arch-3',
          category: 'Concurrency',
          subtopic: 'Memory Consistency: TSO',
          difficulty: 'Mastery',
          front: {
            title: 'Store Buffer Reordering (Store-Load) in x86 TSO',
            prompt: 'In x86-64 Total Store Order (TSO), can a thread observe r1 == 0 and r2 == 0 in the classic Store Buffer litmuss test? Explain the microarchitectural hardware mechanism.',
            codeSnippet: `// Initial: X = 0, Y = 0
// Core 1:          // Core 2:
X = 1;              Y = 1;
r1 = Y;             r2 = X;`,
            codeLanguage: 'cpp',
            questionType: 'invariant',
          },
          back: {
            summary: 'Yes! TSO permits Store-Load reordering because each core has a private FIFO store buffer that buffers writes while allowing subsequent loads to bypass to memory immediately.',
            explanation: 'When Core 1 executes `X = 1`, the write is queued into Core 1\'s private store buffer. To prevent CPU pipeline stalls, Core 1 immediately executes `r1 = Y`. At that moment, Core 2\'s write `Y = 1` may still be sitting in Core 2\'s private store buffer, so both cores read 0 from cache/memory before either write drains to the coherent cache hierarchy.\nTo prevent this, an explicit memory fence instruction (`MFENCE` or locked operation `LOCK CMPXCHG`) is mandatory to drain the store buffer.',
            complexity: {
              time: 'MFENCE incurs pipeline flush cost (~30-50 cycles)',
              space: 'Hardware store buffer depth typically 48-64 entries',
            },
            examKeyPoints: [
              'TSO preserves Store-Store, Load-Load, and Load-Store ordering',
              'Only Store-Load reordering is permitted under x86 TSO',
              'ARM/RISC-V are Weakly Ordered and allow all 4 pairs of reorderings without fences',
            ],
          },
          box: 2,
          repetitions: 1,
          intervalDays: 3,
          lastReviewed: Date.now() - 86400000,
        },
      ],
    },
  },
  {
    id: 'db-internals',
    name: 'Database Systems: WAL, ARIES & B+ Tree Concurrency',
    course: 'CS 645 - Advanced Database System Internals',
    description: 'Write-Ahead Logging, ARIES recovery algorithms, latch-crabbing, and Snapshot Isolation write skew.',
    rawNotes: `Lec 11: Crash Recovery (ARIES) & Index Concurrency
Prof. Hellerstein

1. Write-Ahead Logging (WAL) Protocol:
- Core Rules:
  * Rule 1 (Write-Ahead): Log record representing an update to a database page MUST be flushed to non-volatile disk before the page itself is flushed to disk.
  * Rule 2 (Commit Invariant): All log records up to and including a transaction's COMMIT log record must be flushed to stable storage before the commit call returns to the client.
- PageLSN: Every page header contains PageLSN (Log Sequence Number of the most recent log record that updated this page).
- FlushedLSN: Global in-memory pointer representing the highest LSN flushed to stable disk.
- Page Write Check: Before writing dirty page P to disk, assert(page.PageLSN <= FlushedLSN). If false, force flush log buffer first.

2. ARIES Crash Recovery (Mohan et al., IBM Research):
- Three Sequential Passes:
  1. Analysis Pass:
     - Scan forward from most recent checkpoint.
     - Reconstruct Dirty Page Table (DPT) and Transaction Table (TT).
     - Identifies loser transactions (active transactions without COMMIT/ABORT at crash time).
     - Finds smallest recLSN in DPT (starting point for Redo).
  2. Redo Pass:
     - Scan forward from minimum recLSN in DPT up to end of log.
     - "Repeating History": Redoes ALL logged operations (including losers and non-committed transactions!).
     - Redo optimization check: Skip redo if:
       * Page P not in DPT, OR
       * Log.LSN < DPT[P].recLSN, OR
       * Page is fetched and PageLSN >= Log.LSN.
  3. Undo Pass:
     - Scan backward from end of log, undoing changes made by all loser transactions.
     - For every undone action, append a Compensation Log Record (CLR).
     - CLR contains undoNextLSN pointer pointing to the next LSN to undo for that transaction.
     - Crucial property: CLRs are NEVER undone during repeated crashes! Guarantees bounded recovery time.

3. B+ Tree Concurrency Control: Latch Crabbing (Lock Coupling):
- Search: Read latch child, then release read latch on parent.
- Insert/Delete: Write latch parent, write latch child. If child is "safe" (insert: not full; delete: > min keys), release all ancestral latches.`,
    initialDeck: {
      id: 'deck-db-internals',
      title: 'Database Systems: ARIES Recovery & B+ Tree Latch Crabbing',
      courseSubject: 'CS 645 - Database Internals',
      tags: ['Database Systems', 'Algorithms', 'Data Structures', 'Concurrency'],
      createdAt: Date.now() - 86400000 * 4,
      cards: [
        {
          id: 'card-db-1',
          category: 'Database Internals',
          subtopic: 'ARIES Recovery',
          difficulty: 'Mastery',
          front: {
            title: 'Compensation Log Records (CLRs) & Crash During Recovery',
            prompt: 'In ARIES crash recovery, what is a Compensation Log Record (CLR)? What does its UndoNextLSN field contain, and why are CLRs never undone if the database crashes repeatedly during recovery?',
            questionType: 'invariant',
          },
          back: {
            summary: 'A CLR logs the compensation (undo) of an update and points directly to the next un-undone update via UndoNextLSN, ensuring work already undone is never repeated upon secondary crashes.',
            explanation: 'During the Undo pass, when an update by a loser transaction is reversed, ARIES writes a CLR to the log. The CLR contains `UndoNextLSN = undone_record.PrevLSN`, which bypasses the record just undone. If the system crashes mid-recovery, the subsequent recovery\'s Undo pass encounters the CLR, reads `UndoNextLSN`, and skips directly backward past already-reversed operations without re-undoing them, guaranteeing strictly bounded recovery time.',
            complexity: {
              time: 'Redo: O(Log Length from min recLSN); Undo: O(Loser updates)',
              space: 'O(Dirty Pages + Active Transactions) in RAM',
            },
            examKeyPoints: [
              'CLRs prevent cascading undo loops during repeated crashes',
              'UndoNextLSN skips directly to the predecessor of the original update',
              'Redo pass "repeats history" for BOTH winners AND losers',
            ],
          },
          box: 4,
          repetitions: 5,
          intervalDays: 14,
          lastReviewed: Date.now() - 86400000 * 2,
        },
        {
          id: 'card-db-2',
          category: 'Algorithm',
          subtopic: 'B+ Tree Latching',
          difficulty: 'Advanced',
          front: {
            title: 'B+ Tree Latch Crabbing / Coupling Protocol',
            prompt: 'Explain the Latch Crabbing protocol for concurrent inserts into a B+ tree. Define what makes a node "safe" and when ancestor write latches can be released.',
            questionType: 'definition',
          },
          back: {
            summary: 'Acquire write latch on child before releasing ancestor latches; if child is safe (has space without splitting), release all held ancestor latches immediately.',
            explanation: 'To prevent index structure corruption during concurrent traversal and node splits:\n1. Start at root and acquire Write Latch on root.\n2. Examine child node. Acquire Write Latch on child before releasing latch on parent.\n3. Check if child is "SAFE": For an insert, a node is safe if `child.num_keys < max_keys` (cannot split). For a delete, safe if `child.num_keys > min_keys` (cannot merge).\n4. If the child is safe, release write latches on all ancestor nodes up to the root, allowing concurrent readers and writers access to higher tree levels.',
            complexity: {
              time: 'O(log B N) traversal',
              space: 'O(tree height) latches held concurrently in worst-case root split',
            },
            examKeyPoints: [
              'Latches protect physical memory structures; Locks protect logical transactions',
              'Optimistic lock coupling uses read latches and falls back to crabbing only on split',
              'Worst-case contention occurs at the root if not released early',
            ],
          },
          box: 3,
          repetitions: 3,
          intervalDays: 7,
          lastReviewed: Date.now() - 86400000,
        },
      ],
    },
  },
  {
    id: 'deep-learning',
    name: 'Deep Learning Systems: FlashAttention & KV Cache',
    course: 'CS 682 - Systems for Machine Learning',
    description: 'Hardware-aware attention algorithms, GPU memory hierarchy (HBM vs SRAM), and KV cache scaling formulas.',
    rawNotes: `Lec 8: Efficient Transformers & GPU Kernel Optimization
Prof. Dao / Chen

1. Standard Multi-Head Self-Attention Bottleneck:
- Inputs: Q, K, V in R^{N x d} where N = seq length, d = head dim.
- Formula: S = Q K^T in R^{N x N}; P = softmax(S) in R^{N x N}; O = P V in R^{N x d}.
- IO Complexity: Reading/writing N x N attention matrix P from High-Bandwidth Memory (HBM) to on-chip SRAM requires O(N^2) memory transfers!
- For long contexts (e.g. 32k tokens), memory bandwidth (not FLOPs) is the critical bottleneck on modern Tensor Cores (A100/H100).

2. FlashAttention (Dao et al.):
- Core insight: Compute exact attention without materializing the intermediate N x N matrix P in HBM!
- Technique 1: Tiling (divide Q, K, V into blocks of size B_r x d and B_c x d fitting within 192KB on-chip SRAM).
- Technique 2: Online Softmax algorithm (Milakov & Gimelshein 2018):
  * Running maximum: m_{new} = max(m_{old}, max(x_block))
  * Running normalizer: l_{new} = e^{m_{old} - m_{new}} * l_{old} + sum(e^{x_block - m_{new}})
  * Rescale output accumulator progressively without full sequence reduction.
- Technique 3: Recomputation in backward pass (recompute attention tiles rather than storing N x N activation matrix P), reducing backward memory from O(N^2) to O(N).

3. KV Cache Sizing for Autoregressive LLM Serving:
- In decoding phase, each new token generates a new query, but previously computed Key and Value vectors must be retained in GPU VRAM to avoid recomputing past tokens.
- Formula per sequence:
  Memory_bytes = 2 * (bytes_per_param) * n_layers * n_heads * d_head * seq_len
  With FP16 (2 bytes per param): 4 * n_layers * n_heads * d_head * seq_len
- Example for LLaMA-70B (80 layers, 64 heads, d=128, seq_len=4096, batch=16):
  Total = 16 * 4 * 80 * 64 * 128 * 4096 bytes ~= 171.8 GB just for KV Cache!
  Solved via Grouped-Query Attention (GQA) and Multi-Head Latent Attention (MLA).`,
    initialDeck: {
      id: 'deck-deep-learning',
      title: 'Deep Learning Systems: FlashAttention & KV Cache Geometry',
      courseSubject: 'CS 682 - ML Systems',
      tags: ['Machine Learning', 'Algorithms', 'Deep Learning', 'Computer Architecture'],
      createdAt: Date.now() - 86400000 * 5,
      cards: [
        {
          id: 'card-dl-1',
          category: 'Algorithm',
          subtopic: 'FlashAttention Tiling',
          difficulty: 'Mastery',
          front: {
            title: 'Online Softmax & FlashAttention IO Complexity',
            prompt: 'Explain how FlashAttention avoids materializing the intermediate N x N attention score matrix in GPU High-Bandwidth Memory (HBM). How does online softmax enable block-by-block computation?',
            questionType: 'complexity',
          },
          back: {
            summary: 'FlashAttention tiles Q, K, V into fast on-chip SRAM blocks and uses the online softmax trick to incrementally rescale and accumulate partial outputs without writing the N x N matrix to HBM.',
            explanation: 'Standard attention writes S = QK^T and P = softmax(S) (size N x N) to HBM and reads it back for PV, requiring O(N^2) memory IO. FlashAttention loads blocks of Q, K, and V into 192KB SRAM. Using online softmax, it maintains running statistics (local block max m and running exponential sum l) across blocks:\n`O_new = diag(l_old / l_new) * exp(m_old - m_new) * O_old + (1 / l_new) * exp(S_block - m_new) * V_block`.\nThis scales memory IO down from O(N^2) to O(N d / M) where M is SRAM size, yielding a 2-4x wall-clock speedup.',
            complexity: {
              time: 'FLOPs: O(N^2 d) identical; Memory IO: O(N^2 d^2 / M) vs O(N^2)',
              space: 'Activation memory reduced from O(N^2) to O(N)',
            },
            examKeyPoints: [
              'FlashAttention is an EXACT algorithm, NOT an approximation',
              'SRAM bandwidth is ~19 TB/s vs HBM ~2 TB/s on H100',
              'Backward pass recomputes attention on the fly rather than caching P',
            ],
          },
          box: 3,
          repetitions: 3,
          intervalDays: 8,
          lastReviewed: Date.now() - 86400000,
        },
        {
          id: 'card-dl-2',
          category: 'Complexity',
          subtopic: 'KV Cache Footprint',
          difficulty: 'Advanced',
          front: {
            title: 'Autoregressive KV Cache Memory Derivation',
            prompt: 'Derive the exact formula for the KV cache memory consumption of an autoregressive Transformer model in FP16 precision. Calculate the memory required for batch=8, seq_len=8192, 64 layers, 32 heads, d_head=128.',
            questionType: 'complexity',
          },
          back: {
            summary: 'Formula: Memory = 2 (keys & values) * 2 bytes (FP16) * batch * layers * heads * d_head * seq_len. For the given parameters: ~68.72 GB.',
            explanation: 'Calculation:\nBytes = 2 (for K and V) * 2 (FP16 bytes/val) * 8 (batch) * 64 (layers) * 32 (heads) * 128 (head dim) * 8192 (sequence tokens)\nBytes = 4 * 8 * 64 * 32 * 128 * 8192\n= 4 * 8 * 64 * 32 * 128 * 8192 = 73,819,750,400 bytes\nIn GiB (divide by 1024^3): 73,819,750,400 / 1,073,741,824 = 68.75 GiB.\nThis massive memory footprint explains why modern models adopt Grouped-Query Attention (GQA), which shares key/value heads across query heads to reduce KV cache size by 8x.',
            complexity: {
              time: 'O(1) per token generation with cache vs O(N) without cache',
              space: 'O(batch * layers * heads * d * seq_len)',
            },
            examKeyPoints: [
              'Factor of 2 for Keys and Values; factor of 2 for FP16 (or 1 for FP8)',
              'Scales linearly with sequence length, posing a critical barrier for large contexts',
              'PagedAttention (vLLM) manages KV cache blocks without virtual fragmentation',
            ],
          },
          box: 4,
          repetitions: 4,
          intervalDays: 14,
          lastReviewed: Date.now() - 86400000 * 2,
        },
      ],
    },
  },
];
